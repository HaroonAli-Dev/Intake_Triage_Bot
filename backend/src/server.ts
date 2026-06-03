import app, { dbInit } from './index'

const PORT = Number(process.env.PORT) || 5000

dbInit
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ DB init failed:', err)
    process.exit(1)
  })
