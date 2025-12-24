import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import './Friends.css'

export default function Friends() {
  const { api } = useContext(AuthContext)
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('friends')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [friendsRes, requestsRes, usersRes] = await Promise.all([
      api.get('/friends'),
      api.get('/friend-requests'),
      api.get('/users')
    ])
    setFriends(friendsRes.data)
    setRequests(requestsRes.data)
    setUsers(usersRes.data)
  }

  const acceptRequest = async (id) => {
    await api.post(`/friend-requests/${id}/accept`)
    fetchData()
  }

  const rejectRequest = async (id) => {
    await api.post(`/friend-requests/${id}/reject`)
    fetchData()
  }

  const sendRequest = async (userId) => {
    await api.post('/friend-requests', { toUserId: userId })
    alert('Friend request sent!')
  }

  const nonFriendUsers = users.filter(u => !friends.some(f => f.id === u.id))

  return (
    <div className="friends-page">
      <div className="friends-tabs">
        <button className={tab === 'friends' ? 'active' : ''} onClick={() => setTab('friends')}>
          Friends ({friends.length})
        </button>
        <button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}>
          Requests ({requests.length})
        </button>
        <button className={tab === 'find' ? 'active' : ''} onClick={() => setTab('find')}>
          Find Friends
        </button>
      </div>

      <div className="friends-content">
        {tab === 'friends' && (
          <div className="friends-grid">
            {friends.length === 0 ? (
              <p className="empty">No friends yet. Start connecting!</p>
            ) : (
              friends.map(friend => (
                <Link to={`/profile/${friend.id}`} key={friend.id} className="friend-card">
                  <div className="friend-avatar">{friend.name?.[0]?.toUpperCase()}</div>
                  <span>{friend.name}</span>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="requests-list">
            {requests.length === 0 ? (
              <p className="empty">No pending friend requests.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="request-card">
                  <div className="request-info">
                    <div className="friend-avatar">{req.fromUser?.name?.[0]?.toUpperCase()}</div>
                    <span>{req.fromUser?.name}</span>
                  </div>
                  <div className="request-actions">
                    <button className="accept-btn" onClick={() => acceptRequest(req.id)}>Accept</button>
                    <button className="reject-btn" onClick={() => rejectRequest(req.id)}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'find' && (
          <div className="friends-grid">
            {nonFriendUsers.length === 0 ? (
              <p className="empty">No new people to connect with.</p>
            ) : (
              nonFriendUsers.map(user => (
                <div key={user.id} className="friend-card">
                  <Link to={`/profile/${user.id}`}>
                    <div className="friend-avatar">{user.name?.[0]?.toUpperCase()}</div>
                    <span>{user.name}</span>
                  </Link>
                  <button className="add-btn" onClick={() => sendRequest(user.id)}>+ Add</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
