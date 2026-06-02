export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Message {
  id?: number
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface Ticket {
  id: string
  conversation_id: string
  user_id?: number
  title: string
  summary: string
  category: 'Appointment' | 'Medical Concern' | 'Billing' | 'Complaint' | 'General Inquiry' | 'Technical Issue'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated'
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

export interface AIResponse {
  message: string
  ticketReady: boolean
  ticket?: Partial<Ticket>
  escalate: boolean
}
