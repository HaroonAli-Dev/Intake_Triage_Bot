import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB, pingDb } from './db/db'
import authRoutes from './routes/auth'
import chatRoutes from './routes/chat'
import ticketRoutes from './routes/tickets'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

let dbReady: Promise<void> | null = null

function ensureDbReady(): Promise<void> {
  if (!dbReady) {
    dbReady = initDB().catch(err => {
      dbReady = null
      throw err
    })
  }
  return dbReady
}

app.get('/api/health', async (_req, res) => {
  try {
    await pingDb()
    res.json({ status: 'ok' })
  } catch (err) {
    console.error('Health check failed:', err)
    res.status(503).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Database connection failed',
    })
  }
})

app.use(async (req, res, next) => {
  try {
    await ensureDbReady()
    next()
  } catch (err) {
    console.error('DB init failed:', err)
    res.status(503).json({
      error: err instanceof Error ? err.message : 'Database unavailable',
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/tickets', ticketRoutes)

export default app
