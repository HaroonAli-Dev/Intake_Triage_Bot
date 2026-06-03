import app from './index'
import { initDB } from './db/db'

const PORT = Number(process.env.PORT) || 5000

initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ DB init failed:', err)
    process.exit(1)
  })
