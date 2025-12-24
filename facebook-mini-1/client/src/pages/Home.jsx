import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import CreatePost from '../components/CreatePost'
import Post from '../components/Post'
import './Home.css'

export default function Home() {
  const { api } = useContext(AuthContext)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const res = await api.get('/posts')
    setPosts(res.data)
  }

  const handlePost = async (formData) => {
    const res = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setPosts([{ ...res.data, likes: [], comments: [] }, ...posts])
  }

  const handleLike = async (postId) => {
    const res = await api.post(`/posts/${postId}/like`)
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likedByMe: res.data.liked,
          likes: res.data.liked 
            ? [...(p.likes || []), { id: 'temp' }]
            : (p.likes || []).slice(0, -1)
        }
      }
      return p
    }))
  }

  const handleComment = async (postId, content) => {
    const res = await api.post(`/posts/${postId}/comments`, { content })
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), res.data] }
      }
      return p
    }))
  }

  const handleDelete = async (postId) => {
    await api.delete(`/posts/${postId}`)
    setPosts(posts.filter(p => p.id !== postId))
  }

  return (
    <div className="home">
      <div className="feed">
        <CreatePost onPost={handlePost} />
        {posts.length === 0 ? (
          <div className="empty-feed">
            <p>No posts yet. Add some friends or create your first post!</p>
          </div>
        ) : (
          posts.map(post => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
