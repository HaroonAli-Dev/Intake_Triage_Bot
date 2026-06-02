import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db/db'
import { processMessage } from '../services/aiAgent'
import { Message } from '../types/index'

export const startConversation = async (req: Request, res: Response) => {
  const { name, email } = req.body
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' })

  const conn = await pool.getConnection()
  try {
    let [rows]: any = await conn.execute('SELECT id FROM users WHERE email = ?', [email])
    let userId: number

    if (rows.length === 0) {
      const [result]: any = await conn.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)', [name, email]
      )
      userId = result.insertId
    } else {
      userId = rows[0].id
    }

    const conversationId = uuidv4()
    await conn.execute(
      'INSERT INTO conversations (id, user_id) VALUES (?, ?)', [conversationId, userId]
    )

    res.json({ conversationId, userId })
  } finally {
    conn.release()
  }
}

export const sendMessage = async (req: Request, res: Response) => {
  const { conversationId, message, userId } = req.body
  if (!conversationId || !message) return res.status(400).json({ error: 'Missing fields' })

  const conn = await pool.getConnection()
  try {
    // Save user message
    await conn.execute(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'user', message]
    )

    // Get conversation history
    const [history]: any = await conn.execute(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    )

    // Process with AI
    const aiResponse = await processMessage(message, history as Message[])

    // Save assistant message
    await conn.execute(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'assistant', aiResponse.message]
    )

    // Create ticket if ready
    if (aiResponse.ticketReady && aiResponse.ticket) {
      const ticketId = uuidv4()
      const t = aiResponse.ticket
      const status = aiResponse.escalate ? 'Escalated' : 'Open'

      await conn.execute(
        `INSERT INTO tickets (id, conversation_id, user_id, title, summary, category, priority, status, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticketId, conversationId, userId || null, t.title, t.summary, t.category, t.priority, status, t.assigned_to || null]
      )

      await conn.execute(
        'UPDATE conversations SET status = ? WHERE id = ?',
        ['closed', conversationId]
      )

      return res.json({ ...aiResponse, ticketId })
    }

    res.json(aiResponse)
  } finally {
    conn.release()
  }
}

export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params
  const [messages]: any = await pool.execute(
    'SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [conversationId]
  )
  res.json(messages)
}
