import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDB } from './db/db'
import authRoutes from './routes/auth'
import chatRoutes from './routes/chat'
import ticketRoutes from './routes/tickets'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/tickets', ticketRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
}).catch(err => {
  console.error('❌ DB init failed:', err)
  process.exit(1)
})
