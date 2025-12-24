import { useState, useContext } from 'react'
import { AuthContext } from '../App'
import './CreatePost.css'

export default function CreatePost({ onPost }) {
  const { user } = useContext(AuthContext)
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !image) return
    
    const formData = new FormData()
    formData.append('content', content)
    if (image) formData.append('image', image)
    
    await onPost(formData)
    setContent('')
    setImage(null)
    setPreview(null)
  }

  return (
    <div className="create-post">
      <div className="create-post-header">
        <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <form onSubmit={handleSubmit} className="create-post-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            rows={3}
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}>×</button>
            </div>
          )}
          <div className="create-post-actions">
            <label className="upload-btn">
              📷 Photo
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
            <button type="submit" className="post-btn">Post</button>
          </div>
        </form>
      </div>
    </div>
  )
}
