import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/chat')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-header">
          <div className="auth-icon">🛠</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        <form className="auth-form" onSubmit={handleLogin}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  )
}
