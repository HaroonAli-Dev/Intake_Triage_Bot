import { Request, Response } from 'express'
import { query } from '../db/db'

export const getAllTickets = async (req: Request, res: Response) => {
  const { status, category, priority } = req.query
  let sql = `SELECT t.*, u.name as user_name, u.email as user_email
             FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE 1=1`
  const params: unknown[] = []
  let n = 1

  if (status) {
    sql += ` AND t.status = $${n++}`
    params.push(status)
  }
  if (category) {
    sql += ` AND t.category = $${n++}`
    params.push(category)
  }
  if (priority) {
    sql += ` AND t.priority = $${n++}`
    params.push(priority)
  }

  sql += ' ORDER BY t.created_at DESC'
  const tickets = await query(sql, params)
  res.json(tickets)
}

export const getTicketById = async (req: Request, res: Response) => {
  const tickets = await query(
    `SELECT t.*, u.name as user_name, u.email as user_email
     FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = $1`,
    [req.params.id]
  )
  if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' })
  res.json(tickets[0])
}

export const updateTicket = async (req: Request, res: Response) => {
  const { status, assigned_to } = req.body
  await query(
    'UPDATE tickets SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [status, assigned_to, req.params.id]
  )
  res.json({ success: true })
}

export const getStats = async (_req: Request, res: Response) => {
  const [total] = await query<{ count: string }>('SELECT COUNT(*)::int as count FROM tickets')
  const byStatus = await query('SELECT status, COUNT(*)::int as count FROM tickets GROUP BY status')
  const byCategory = await query('SELECT category, COUNT(*)::int as count FROM tickets GROUP BY category')
  const byPriority = await query('SELECT priority, COUNT(*)::int as count FROM tickets GROUP BY priority')

  res.json({
    total: total.count,
    byStatus,
    byCategory,
    byPriority,
  })
}
