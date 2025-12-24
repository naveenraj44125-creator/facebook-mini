const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'facebook-mini-secret-key';

// In-memory database
const db = {
  users: [],
  posts: [],
  comments: [],
  friendRequests: [],
  friends: [],
  likes: [],
  notifications: []
};

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, password: hashedPassword, name, avatar: null, bio: '', createdAt: new Date() };
  db.users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar, bio: user.bio });
});

// User routes
app.get('/api/users', auth, (req, res) => {
  const users = db.users.filter(u => u.id !== req.user.id).map(u => ({
    id: u.id, name: u.name, avatar: u.avatar
  }));
  res.json(users);
});

app.get('/api/users/:id', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, avatar: user.avatar, bio: user.bio });
});

// Post routes
app.get('/api/posts', auth, (req, res) => {
  const userFriends = db.friends.filter(f => f.userId === req.user.id || f.friendId === req.user.id);
  const friendIds = userFriends.map(f => f.userId === req.user.id ? f.friendId : f.userId);
  friendIds.push(req.user.id);
  
  const posts = db.posts
    .filter(p => friendIds.includes(p.userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(p => {
      const author = db.users.find(u => u.id === p.userId);
      const likes = db.likes.filter(l => l.postId === p.id);
      const comments = db.comments.filter(c => c.postId === p.id).map(c => {
        const commentAuthor = db.users.find(u => u.id === c.userId);
        return { ...c, author: { id: commentAuthor?.id, name: commentAuthor?.name, avatar: commentAuthor?.avatar } };
      });
      return {
        ...p,
        author: { id: author?.id, name: author?.name, avatar: author?.avatar },
        likes,
        likedByMe: likes.some(l => l.userId === req.user.id),
        comments
      };
    });
  res.json(posts);
});

app.post('/api/posts', auth, upload.single('image'), (req, res) => {
  const post = {
    id: uuidv4(),
    userId: req.user.id,
    content: req.body.content,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date()
  };
  db.posts.push(post);
  const author = db.users.find(u => u.id === req.user.id);
  res.json({ ...post, author: { id: author.id, name: author.name, avatar: author.avatar }, likes: [], comments: [] });
});

app.delete('/api/posts/:id', auth, (req, res) => {
  const idx = db.posts.findIndex(p => p.id === req.params.id && p.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  db.posts.splice(idx, 1);
  res.json({ success: true });
});

// Like routes
app.post('/api/posts/:id/like', auth, (req, res) => {
  const existingLike = db.likes.find(l => l.postId === req.params.id && l.userId === req.user.id);
  if (existingLike) {
    db.likes = db.likes.filter(l => l.id !== existingLike.id);
    return res.json({ liked: false });
  }
  db.likes.push({ id: uuidv4(), postId: req.params.id, userId: req.user.id });
  res.json({ liked: true });
});

// Comment routes
app.post('/api/posts/:id/comments', auth, (req, res) => {
  const comment = {
    id: uuidv4(),
    postId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
    createdAt: new Date()
  };
  db.comments.push(comment);
  const author = db.users.find(u => u.id === req.user.id);
  res.json({ ...comment, author: { id: author.id, name: author.name, avatar: author.avatar } });
});

// Friend routes
app.get('/api/friends', auth, (req, res) => {
  const userFriends = db.friends.filter(f => f.userId === req.user.id || f.friendId === req.user.id);
  const friends = userFriends.map(f => {
    const friendId = f.userId === req.user.id ? f.friendId : f.userId;
    const friend = db.users.find(u => u.id === friendId);
    return { id: friend?.id, name: friend?.name, avatar: friend?.avatar };
  });
  res.json(friends);
});

app.post('/api/friend-requests', auth, (req, res) => {
  const { toUserId } = req.body;
  const existing = db.friendRequests.find(fr => 
    (fr.fromUserId === req.user.id && fr.toUserId === toUserId) ||
    (fr.fromUserId === toUserId && fr.toUserId === req.user.id)
  );
  if (existing) return res.status(400).json({ error: 'Request already exists' });
  
  const request = { id: uuidv4(), fromUserId: req.user.id, toUserId, status: 'pending', createdAt: new Date() };
  db.friendRequests.push(request);
  res.json(request);
});

app.get('/api/friend-requests', auth, (req, res) => {
  const requests = db.friendRequests
    .filter(fr => fr.toUserId === req.user.id && fr.status === 'pending')
    .map(fr => {
      const fromUser = db.users.find(u => u.id === fr.fromUserId);
      return { ...fr, fromUser: { id: fromUser?.id, name: fromUser?.name, avatar: fromUser?.avatar } };
    });
  res.json(requests);
});

app.post('/api/friend-requests/:id/accept', auth, (req, res) => {
  const request = db.friendRequests.find(fr => fr.id === req.params.id && fr.toUserId === req.user.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  request.status = 'accepted';
  db.friends.push({ id: uuidv4(), userId: request.fromUserId, friendId: request.toUserId, createdAt: new Date() });
  res.json({ success: true });
});

app.post('/api/friend-requests/:id/reject', auth, (req, res) => {
  const idx = db.friendRequests.findIndex(fr => fr.id === req.params.id && fr.toUserId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Request not found' });
  db.friendRequests.splice(idx, 1);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
