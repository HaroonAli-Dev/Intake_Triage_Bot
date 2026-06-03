import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/db'

const JWT_SECRET = process.env.JWT_SECRET!

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })

  const existing = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' })

  const hashed = await bcrypt.hash(password, 10)
  const [row] = await query<{ id: number }>(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, email, hashed, 'user']
  )

  const token = jwt.sign({ id: row.id, role: 'user', name, email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: row.id, name, email, role: 'user' } })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const rows = await query<{ id: number; name: string; email: string; role: string; password: string }>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' })

  const user = rows[0]
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}
