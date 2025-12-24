import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../App'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">facebook mini</Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/friends" className="nav-link">👥 Friends</Link>
          <Link to={`/profile/${user?.id}`} className="nav-link">👤 Profile</Link>
          <button onClick={logout} className="nav-btn">Logout</button>
        </div>
      </div>
    </nav>
  )
}
