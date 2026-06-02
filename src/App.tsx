import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Chat from './pages/Chat'
import Admin from './pages/Admin'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/">💬 Chat</Link>
        <Link to="/admin">🛠 Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
