import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/db'

const JWT_SECRET = process.env.JWT_SECRET!

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })

  const [existing]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' })

  const hashed = await bcrypt.hash(password, 10)
  const [result]: any = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashed, 'user']
  )

  const token = jwt.sign({ id: result.insertId, role: 'user', name, email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: result.insertId, name, email, role: 'user' } })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' })

  const user = rows[0]
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
