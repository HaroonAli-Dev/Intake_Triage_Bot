import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { query, transaction } from '../db/db'
import type { Message } from '../types/index'
import type { AuthRequest } from '../middleware/auth'

export const startConversation = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const conversationId = uuidv4()
  await query('INSERT INTO conversations (id, user_id) VALUES ($1, $2)', [conversationId, userId])
  res.json({ conversationId, userId })
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { conversationId, message } = req.body
  const userId = req.user!.id
  if (!conversationId || !message) return res.status(400).json({ error: 'Missing fields' })

  const result = await transaction(async (client) => {
    await client.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', message]
    )

    const history = await client.query(
      'SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    )

    const { processMessage } = await import('../services/aiAgent')
    const aiResponse = await processMessage(message, history.rows as Message[])

    await client.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'assistant', aiResponse.message]
    )

    if (aiResponse.ticketReady && aiResponse.ticket) {
      const ticketId = uuidv4()
      const t = aiResponse.ticket
      const status = aiResponse.escalate ? 'Escalated' : 'Open'

      await client.query(
        `INSERT INTO tickets (id, conversation_id, user_id, title, summary, category, priority, status, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          ticketId,
          conversationId,
          userId,
          t.title,
          t.summary,
          t.category,
          t.priority,
          status,
          t.assigned_to || null,
        ]
      )

      await client.query('UPDATE conversations SET status = $1 WHERE id = $2', ['closed', conversationId])
      return { ...aiResponse, ticketId }
    }

    return aiResponse
  })

  res.json(result)
}

export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params
  const messages = await query(
    'SELECT role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  )
  res.json(messages)
}
