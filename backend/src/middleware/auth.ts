import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface AuthRequest extends Request {
  user?: { id: number; role: string; name: string; email: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthRequest['user']
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  next()
}
