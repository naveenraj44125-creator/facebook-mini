const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./facebook_mini.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_picture TEXT,
    cover_photo TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Likes table
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (post_id) REFERENCES posts (id),
    UNIQUE(user_id, post_id)
  )`);

  // Comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (post_id) REFERENCES posts (id)
  )`);

  // Friends table
  db.run(`CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users (id),
    FOREIGN KEY (user2_id) REFERENCES users (id),
    UNIQUE(user1_id, user2_id)
  )`);
});

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper function to upload file to S3
const uploadToS3 = async (file, folder = 'uploads') => {
  const key = `${folder}/${uuidv4()}-${file.originalname}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw error;
  }
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign({ userId: this.lastID, username }, JWT_SECRET);
        res.json({
          token,
          user: {
            id: this.lastID,
            username,
            email,
            firstName,
            lastName
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          profilePicture: user.profile_picture,
          coverPhoto: user.cover_photo,
          bio: user.bio
        }
      });
    }
  );
});

// Get current user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(
    'SELECT id, username, email, first_name, last_name, profile_picture, cover_photo, bio, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
        coverPhoto: user.cover_photo,
        bio: user.bio,
        createdAt: user.created_at
      });
    }
  );
});

// Get specific user profile
app.get('/api/profile/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;

  db.get(
    'SELECT id, username, email, first_name, last_name, profile_picture, cover_photo, bio, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
        coverPhoto: user.cover_photo,
        bio: user.bio,
        createdAt: user.created_at
      });
    }
  );
});

// Update profile picture
app.post('/api/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const imageUrl = await uploadToS3(req.file, 'profile-pictures');
    
    db.run(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [imageUrl, req.user.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile picture' });
        }
        res.json({ profilePicture: imageUrl });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Create post
app.post('/api/posts', authenticateToken, upload.single('media'), async (req, res) => {
  const { content } = req.body;
  let mediaUrl = null;

  if (!content && !req.file) {
    return res.status(400).json({ error: 'Post must have content or media' });
  }

  try {
    if (req.file) {
      const folder = req.file.mimetype.startsWith('video/') ? 'videos' : 'images';
      mediaUrl = await uploadToS3(req.file, folder);
    }

    const imageUrl = req.file && req.file.mimetype.startsWith('image/') ? mediaUrl : null;
    const videoUrl = req.file && req.file.mimetype.startsWith('video/') ? mediaUrl : null;

    db.run(
      'INSERT INTO posts (user_id, content, image_url, video_url) VALUES (?, ?, ?, ?)',
      [req.user.userId, content || '', imageUrl, videoUrl],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create post' });
        }

        // Emit new post to all connected users
        io.emit('newPost', {
          id: this.lastID,
          userId: req.user.userId,
          content: content || '',
          imageUrl,
          videoUrl,
          createdAt: new Date().toISOString()
        });

        res.json({
          id: this.lastID,
          userId: req.user.userId,
          content: content || '',
          imageUrl,
          videoUrl,
          createdAt: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get posts (feed)
app.get('/api/posts', authenticateToken, (req, res) => {
  const query = `
    SELECT p.*, u.username, u.first_name, u.last_name, u.profile_picture,
           COUNT(DISTINCT l.id) as likes_count,
           COUNT(DISTINCT c.id) as comments_count,
           EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) as user_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  db.all(query, [req.user.userId], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    const formattedPosts = posts.map(post => ({
      id: post.id,
      userId: post.user_id,
      content: post.content,
      imageUrl: post.image_url,
      videoUrl: post.video_url,
      createdAt: post.created_at,
      author: {
        username: post.username,
        firstName: post.first_name,
        lastName: post.last_name,
        profilePicture: post.profile_picture
      },
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      userLiked: Boolean(post.user_liked)
    }));

    res.json(formattedPosts);
  });
});

// Like/Unlike post
app.post('/api/posts/:postId/like', authenticateToken, (req, res) => {
  const postId = req.params.postId;

  // Check if user already liked the post
  db.get(
    'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
    [req.user.userId, postId],
    (err, existingLike) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to process like' });
      }

      if (existingLike) {
        // Unlike the post
        db.run(
          'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
          [req.user.userId, postId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to unlike post' });
            }
            res.json({ liked: false });
          }
        );
      } else {
        // Like the post
        db.run(
          'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
          [req.user.userId, postId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to like post' });
            }
            res.json({ liked: true });
          }
        );
      }
    }
  );
});

// Add comment to post
app.post('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;

  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  db.run(
    'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
    [req.user.userId, postId, content],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add comment' });
      }

      // Get the comment with user info
      db.get(
        `SELECT c.*, u.username, u.first_name, u.last_name, u.profile_picture
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [this.lastID],
        (err, comment) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch comment' });
          }

          const formattedComment = {
            id: comment.id,
            userId: comment.user_id,
            postId: comment.post_id,
            content: comment.content,
            createdAt: comment.created_at,
            author: {
              username: comment.username,
              firstName: comment.first_name,
              lastName: comment.last_name,
              profilePicture: comment.profile_picture
            }
          };

          res.json(formattedComment);
        }
      );
    }
  );
});

// Get comments for a post
app.get('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  const postId = req.params.postId;

  const query = `
    SELECT c.*, u.username, u.first_name, u.last_name, u.profile_picture
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;

  db.all(query, [postId], (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      postId: comment.post_id,
      content: comment.content,
      createdAt: comment.created_at,
      author: {
        username: comment.username,
        firstName: comment.first_name,
        lastName: comment.last_name,
        profilePicture: comment.profile_picture
      }
    }));

    res.json(formattedComments);
  });
});

// Search users
app.get('/api/search/users', authenticateToken, (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  db.all(
    `SELECT id, username, first_name, last_name, profile_picture
     FROM users
     WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ?
     LIMIT 20`,
    [`%${q}%`, `%${q}%`, `%${q}%`],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Search failed' });
      }

      res.json(users.map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture
      })));
    }
  );
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
