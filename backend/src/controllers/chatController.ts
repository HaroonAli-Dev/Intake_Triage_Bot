import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db/db'
import { processMessage } from '../services/aiAgent'
import type { Message } from '../types/index'
import type { AuthRequest } from '../middleware/auth'

export const startConversation = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const conversationId = uuidv4()
  await pool.execute('INSERT INTO conversations (id, user_id) VALUES (?, ?)', [conversationId, userId])
  res.json({ conversationId, userId })
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { conversationId, message } = req.body
  const userId = req.user!.id
  if (!conversationId || !message) return res.status(400).json({ error: 'Missing fields' })

  const conn = await pool.getConnection()
  try {
    await conn.execute(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'user', message]
    )

    const [history]: any = await conn.execute(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    )

    const aiResponse = await processMessage(message, history as Message[])

    await conn.execute(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversationId, 'assistant', aiResponse.message]
    )

    if (aiResponse.ticketReady && aiResponse.ticket) {
      const ticketId = uuidv4()
      const t = aiResponse.ticket
      const status = aiResponse.escalate ? 'Escalated' : 'Open'

      await conn.execute(
        `INSERT INTO tickets (id, conversation_id, user_id, title, summary, category, priority, status, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticketId, conversationId, userId, t.title, t.summary, t.category, t.priority, status, t.assigned_to || null]
      )

      await conn.execute('UPDATE conversations SET status = ? WHERE id = ?', ['closed', conversationId])
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
