import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startConversation, sendMessage } from '../services/api'
import type { Message, User } from '../types/index'
import './Chat.css'

export default function Chat() {
  const user: User = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [closed, setClosed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await startConversation()
        setConversationId(res.data.conversationId)
        setMessages([{ role: 'assistant', content: `Hi ${user.name}! 👋 I'm your support assistant. Please describe your issue and I'll help route it to the right team.` }])
      } catch {
        setMessages([{ role: 'assistant', content: '⚠️ Failed to connect to support server. Please refresh the page.' }])
      }
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || closed) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await sendMessage(conversationId, input)
      const data = res.data
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      if (data.ticketReady && data.ticketId) {
        setTicketId(data.ticketId)
        setClosed(true)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-box">
        <div className="chat-header">
          <div className="chat-header-avatar">🛠</div>
          <div className="chat-header-info">
            <h3>Support Assistant</h3>
            <p>AI-powered intake & triage</p>
          </div>
          <div className="chat-header-right">
            <span className="user-name">👤 {user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="avatar">{m.role === 'assistant' ? '🤖' : '👤'}</div>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="avatar">🤖</div>
              <div className="typing-bubble"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {ticketId && (
          <div className="ticket-banner">
            ✅ Ticket created successfully! ID: <strong>{ticketId}</strong>
          </div>
        )}

        <div className="input-area">
          <input
            placeholder={closed ? 'Conversation closed — ticket submitted' : 'Type your message...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading || closed}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading || closed} title="Send">➤</button>
        </div>
      </div>
    </div>
  )
}
