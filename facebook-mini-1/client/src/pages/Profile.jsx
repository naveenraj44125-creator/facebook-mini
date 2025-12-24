import { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../App'
import './Profile.css'

export default function Profile() {
  const { id } = useParams()
  const { api, user: currentUser } = useContext(AuthContext)
  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])

  useEffect(() => {
    fetchProfile()
    fetchFriends()
  }, [id])

  const fetchProfile = async () => {
    const res = await api.get(`/users/${id}`)
    setUser(res.data)
  }

  const fetchFriends = async () => {
    const res = await api.get('/friends')
    setFriends(res.data)
  }

  const isFriend = friends.some(f => f.id === id)
  const isOwnProfile = currentUser?.id === id

  const sendFriendRequest = async () => {
    await api.post('/friend-requests', { toUserId: id })
    alert('Friend request sent!')
  }

  if (!user) return <div className="profile-loading">Loading...</div>

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <h1>{user.name}</h1>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          {!isOwnProfile && !isFriend && (
            <button onClick={sendFriendRequest} className="add-friend-btn">
              + Add Friend
            </button>
          )}
          {isFriend && <span className="friend-badge">✓ Friends</span>}
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-section">
          <h2>About</h2>
          <p>{user.bio || 'No bio yet.'}</p>
        </div>
      </div>
    </div>
  )
}
