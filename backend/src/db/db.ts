import mysql2 from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_PORT ? { rejectUnauthorized: false } : undefined
})

export const initDB = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT,
      status ENUM('active', 'closed') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id VARCHAR(36) NOT NULL,
      role ENUM('user', 'assistant') NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id VARCHAR(36) PRIMARY KEY,
      conversation_id VARCHAR(36),
      user_id INT,
      title VARCHAR(255) NOT NULL,
      summary TEXT NOT NULL,
      category ENUM('Appointment', 'Medical Concern', 'Billing', 'Complaint', 'General Inquiry', 'Technical Issue') NOT NULL,
      priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
      status ENUM('Open', 'In Progress', 'Resolved', 'Escalated') DEFAULT 'Open',
      assigned_to VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  // Seed admin account if not exists
  const [rows]: any = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@admin.com'])
  if (rows.length === 0) {
    const hashed = await bcrypt.hash('admin', 10)
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@admin.com', hashed, 'admin']
    )
    console.log('✅ Admin account created (email: admin@admin.com, password: admin)')
  }

  console.log('✅ Database tables ready')
}

export default pool
