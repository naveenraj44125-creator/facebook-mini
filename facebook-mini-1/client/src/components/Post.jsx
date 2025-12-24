import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import './Post.css'

export default function Post({ post, onLike, onComment, onDelete }) {
  const { user } = useContext(AuthContext)
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  const handleComment = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      onComment(post.id, comment)
      setComment('')
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="post">
      <div className="post-header">
        <Link to={`/profile/${post.author?.id}`} className="post-author">
          <div className="avatar">{post.author?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="author-name">{post.author?.name}</div>
            <div className="post-time">{timeAgo(post.createdAt)}</div>
          </div>
        </Link>
        {post.userId === user?.id && (
          <button className="delete-btn" onClick={() => onDelete(post.id)}>×</button>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      {post.image && <img src={post.image} alt="Post" className="post-image" />}
      <div className="post-stats">
        <span>{post.likes?.length || 0} likes</span>
        <span onClick={() => setShowComments(!showComments)} style={{ cursor: 'pointer' }}>
          {post.comments?.length || 0} comments
        </span>
      </div>
      <div className="post-actions">
        <button className={`action-btn ${post.likedByMe ? 'liked' : ''}`} onClick={() => onLike(post.id)}>
          {post.likedByMe ? '❤️' : '🤍'} Like
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          💬 Comment
        </button>
      </div>
      {showComments && (
        <div className="comments-section">
          {post.comments?.map(c => (
            <div key={c.id} className="comment">
              <Link to={`/profile/${c.author?.id}`} className="comment-author">{c.author?.name}</Link>
              <span className="comment-text">{c.content}</span>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  )
}
