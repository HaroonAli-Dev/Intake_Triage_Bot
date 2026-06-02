import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTickets, updateTicket, getStats } from '../services/api'
import type { Ticket, Stats } from '../types/index'
import './Admin.css'

const CATEGORIES = ['All', 'Appointment', 'Medical Concern', 'Billing', 'Complaint', 'General Inquiry', 'Technical Issue']
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Escalated']
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical']

const priorityColor: Record<string, string> = {
  Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#7f1d1d'
}

const statusColor: Record<string, string> = {
  Open: '#4f46e5', 'In Progress': '#f59e0b', Resolved: '#10b981', Escalated: '#ef4444'
}

export default function Admin() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [editStatus, setEditStatus] = useState('')
  const [editAssigned, setEditAssigned] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (filterStatus !== 'All') params.status = filterStatus
      if (filterCategory !== 'All') params.category = filterCategory
      if (filterPriority !== 'All') params.priority = filterPriority
      const [t, s] = await Promise.all([getTickets(params), getStats()])
      setTickets(t.data)
      setStats(s.data)
      setFetchError('')
    } catch {
      setFetchError('Failed to load tickets. Please refresh.')
    }
  }

  useEffect(() => { fetchData() }, [filterStatus, filterCategory, filterPriority])

  const handleSelect = (ticket: Ticket) => {
    setSelected(ticket)
    setEditStatus(ticket.status)
    setEditAssigned(ticket.assigned_to || '')
  }

  const handleUpdate = async () => {
    if (!selected) return
    setLoading(true)
    await updateTicket(selected.id, { status: editStatus, assigned_to: editAssigned })
    await fetchData()
    setSelected(null)
    setLoading(false)
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <div>
          <h1>📋 Support Admin Dashboard</h1>
          <p>Manage and triage incoming support tickets</p>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          {stats.byStatus.map(s => (
            <div className="stat-card" key={s.status}>
              <div className="stat-value" style={{ color: statusColor[s.status] }}>{s.count}</div>
              <div className="stat-label">{s.status}</div>
            </div>
          ))}
        </div>
      )}

      <div className="filters">
        {fetchError && <p className="fetch-error">{fetchError}</p>}
        <label>Filter by:</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="admin-body">
        <div className="ticket-list">
          {tickets.length === 0 && <p className="empty">No tickets found</p>}
          {tickets.map(t => (
            <div
              key={t.id}
              className={`ticket-card ${selected?.id === t.id ? 'active' : ''}`}
              onClick={() => handleSelect(t)}
            >
              <div className="ticket-top">
                <span className="ticket-title">{t.title}</span>
                <span className="priority-badge" style={{ background: priorityColor[t.priority] }}>
                  {t.priority}
                </span>
              </div>
              <div className="ticket-meta">
                <span className="category-tag">{t.category}</span>
                <span className="status-badge" style={{ color: statusColor[t.status] }}>{t.status}</span>
              </div>
              <div className="ticket-footer">
                <span className="ticket-user">👤 {t.user_name}</span>
                <span className="ticket-date">{new Date(t.created_at!).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="ticket-detail">
            <div className="detail-header">
              <h2>{selected.title}</h2>
              <span className="priority-badge" style={{ background: priorityColor[selected.priority] }}>
                {selected.priority}
              </span>
            </div>
            <p className="summary">{selected.summary}</p>
            <div className="detail-grid">
              <div className="detail-item"><label>Category</label><span>{selected.category}</span></div>
              <div className="detail-item"><label>Status</label><span style={{ color: statusColor[selected.status] }}>{selected.status}</span></div>
              <div className="detail-item"><label>User</label><span>{selected.user_name}</span></div>
              <div className="detail-item"><label>Email</label><span>{selected.user_email}</span></div>
            </div>
            <div className="divider" />
            <div className="edit-section">
              <div className="edit-group">
                <label>Update Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  {STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="edit-group">
                <label>Assign To</label>
                <input value={editAssigned} onChange={e => setEditAssigned(e.target.value)} placeholder="Staff name or team" />
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn-save" onClick={handleUpdate} disabled={loading}>
                {loading ? 'Saving...' : '✓ Save Changes'}
              </button>
              <button className="btn-cancel" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
