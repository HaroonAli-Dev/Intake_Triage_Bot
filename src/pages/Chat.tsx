import { useState, useRef, useEffect } from 'react'
import { startConversation, sendMessage } from '../services/api'
import { Message } from '../types/index'
import './Chat.css'

export default function Chat() {
  const [step, setStep] = useState<'form' | 'chat'>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [userId, setUserId] = useState<number>(0)
  const [ticketId, setTicketId] = useState('')
  const [closed, setClosed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await startConversation(name, email)
      setConversationId(res.data.conversationId)
      setUserId(res.data.userId)
      setMessages([{ role: 'assistant', content: `Hi ${name}! 👋 I'm your support assistant. Please describe your issue and I'll help route it to the right team.` }])
      setStep('chat')
    } catch {
      alert('Failed to start conversation. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading || closed) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendMessage(conversationId, input, userId)
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

  if (step === 'form') {
    return (
      <div className="chat-wrapper">
        <div className="chat-box">
          <div className="chat-header">
            <span>🎓 University Support</span>
          </div>
          <form className="start-form" onSubmit={handleStart}>
            <h2>Start a Support Request</h2>
            <p>Please enter your details to begin</p>
            <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? 'Starting...' : 'Start Chat'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-box">
        <div className="chat-header">
          <span>🎓 University Support</span>
          <span className="header-sub">AI Triage Agent</span>
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="bubble typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {ticketId && (
          <div className="ticket-banner">
            ✅ Ticket created! ID: <strong>{ticketId}</strong>
          </div>
        )}

        <div className="input-area">
          <input
            placeholder={closed ? 'Conversation closed' : 'Type your message...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading || closed}
          />
          <button onClick={handleSend} disabled={loading || closed}>Send</button>
        </div>
      </div>
    </div>
  )
}
