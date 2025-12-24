import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import './Auth.css'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1>facebook mini</h1>
        <p>Connect with friends and the world around you.</p>
      </div>
      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Log In</button>
        </form>
        <hr />
        <Link to="/register" className="btn-secondary">Create New Account</Link>
      </div>
    </div>
  )
}
