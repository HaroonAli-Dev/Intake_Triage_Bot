export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface Ticket {
  id: string
  conversation_id: string
  user_name?: string
  user_email?: string
  title: string
  summary: string
  category: 'Appointment' | 'Medical Concern' | 'Billing' | 'Complaint' | 'General Inquiry' | 'Technical Issue'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated'
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

export interface Stats {
  total: number
  byStatus: { status: string; count: number }[]
  byCategory: { category: string; count: number }[]
  byPriority: { priority: string; count: number }[]
}
