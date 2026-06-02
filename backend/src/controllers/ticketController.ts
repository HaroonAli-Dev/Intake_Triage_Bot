import { Request, Response } from 'express'
import pool from '../db/db'

export const getAllTickets = async (req: Request, res: Response) => {
  const { status, category, priority } = req.query
  let query = `SELECT t.*, u.name as user_name, u.email as user_email 
               FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE 1=1`
  const params: any[] = []

  if (status) { query += ' AND t.status = ?'; params.push(status) }
  if (category) { query += ' AND t.category = ?'; params.push(category) }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority) }

  query += ' ORDER BY t.created_at DESC'
  const [tickets]: any = await pool.execute(query, params)
  res.json(tickets)
}

export const getTicketById = async (req: Request, res: Response) => {
  const [tickets]: any = await pool.execute(
    `SELECT t.*, u.name as user_name, u.email as user_email 
     FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
    [req.params.id]
  )
  if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' })
  res.json(tickets[0])
}

export const updateTicket = async (req: Request, res: Response) => {
  const { status, assigned_to } = req.body
  await pool.execute(
    'UPDATE tickets SET status = ?, assigned_to = ? WHERE id = ?',
    [status, assigned_to, req.params.id]
  )
  res.json({ success: true })
}

export const getStats = async (req: Request, res: Response) => {
  const [total]: any = await pool.execute('SELECT COUNT(*) as count FROM tickets')
  const [byStatus]: any = await pool.execute('SELECT status, COUNT(*) as count FROM tickets GROUP BY status')
  const [byCategory]: any = await pool.execute('SELECT category, COUNT(*) as count FROM tickets GROUP BY category')
  const [byPriority]: any = await pool.execute('SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority')

  res.json({
    total: total[0].count,
    byStatus,
    byCategory,
    byPriority
  })
}
