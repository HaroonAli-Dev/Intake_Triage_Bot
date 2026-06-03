import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB, pingDb } from './db/db'
import authRoutes from './routes/auth'
import chatRoutes from './routes/chat'
import ticketRoutes from './routes/tickets'

dotenv.config()

const app = express()

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('CORS not allowed'))
  },
  credentials: true,
}))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

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

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
