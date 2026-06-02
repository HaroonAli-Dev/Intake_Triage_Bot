import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'
import './Auth.css'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(name, email, password)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/chat')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-icon">👋</div>
          <h2>Create Account</h2>
          <p>Join to get support assistance</p>
        </div>
        <form className="auth-form" onSubmit={handleRegister}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in here</Link></p>
      </div>
    </div>
  )
}
