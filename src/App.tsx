import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function NavBar() {
  const location = useLocation()
  const hideNav = ['/login', '/register'].includes(location.pathname)
  if (hideNav) return null

  return (
    <nav className="nav">
      <NavLink to="/chat" className="nav-brand">
        <div className="brand-icon">🏥</div>
        Intake Triage Bot
      </NavLink>
      <div className="nav-links">
        <NavLink to="/chat">💬 Chat</NavLink>
        <NavLink to="/admin">📋 Admin</NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={
          <ProtectedRoute role="user">
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
