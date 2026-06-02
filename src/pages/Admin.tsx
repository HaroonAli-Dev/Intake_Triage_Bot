import { useState, useEffect } from 'react'
import { getTickets, updateTicket, getStats } from '../services/api'
import { Ticket, Stats } from '../types/index'
import './Admin.css'

const CATEGORIES = ['All', 'Admission', 'Fee Issue', 'Scholarship', 'Technical Support', 'Hostel', 'FYP']
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Escalated']
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical']

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

  const fetchData = async () => {
    const params: Record<string, string> = {}
    if (filterStatus !== 'All') params.status = filterStatus
    if (filterCategory !== 'All') params.category = filterCategory
    if (filterPriority !== 'All') params.priority = filterPriority
    const [t, s] = await Promise.all([getTickets(params), getStats()])
    setTickets(t.data)
    setStats(s.data)
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

  const priorityColor: Record<string, string> = {
    Low: '#34a853', Medium: '#fbbc04', High: '#ea4335', Critical: '#9c0000'
  }

  const statusColor: Record<string, string> = {
    Open: '#1a73e8', 'In Progress': '#f9ab00', Resolved: '#34a853', Escalated: '#ea4335'
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-header">
        <h1>🎓 Support Admin Dashboard</h1>
      </div>

      {stats && (
        <div className="stats-row">
          <div className="stat-card"><span>{stats.total}</span><p>Total Tickets</p></div>
          {stats.byStatus.map(s => (
            <div className="stat-card" key={s.status}>
              <span style={{ color: statusColor[s.status] }}>{s.count}</span>
              <p>{s.status}</p>
            </div>
          ))}
        </div>
      )}

      <div className="filters">
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
                <span>{t.category}</span>
                <span className="status-badge" style={{ color: statusColor[t.status] }}>{t.status}</span>
              </div>
              <div className="ticket-user">{t.user_name} · {t.user_email}</div>
              <div className="ticket-date">{new Date(t.created_at!).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="ticket-detail">
            <h2>{selected.title}</h2>
            <p className="summary">{selected.summary}</p>
            <div className="detail-grid">
              <div><label>Category</label><span>{selected.category}</span></div>
              <div><label>Priority</label><span style={{ color: priorityColor[selected.priority] }}>{selected.priority}</span></div>
              <div><label>User</label><span>{selected.user_name}</span></div>
              <div><label>Email</label><span>{selected.user_email}</span></div>
            </div>
            <div className="edit-section">
              <div>
                <label>Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  {STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Assigned To</label>
                <input value={editAssigned} onChange={e => setEditAssigned(e.target.value)} placeholder="Staff name" />
              </div>
            </div>
            <div className="detail-actions">
              <button onClick={handleUpdate} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              <button className="cancel" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
