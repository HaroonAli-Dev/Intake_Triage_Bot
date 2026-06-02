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
  category: 'Admission' | 'Fee Issue' | 'Scholarship' | 'Technical Support' | 'Hostel' | 'FYP'
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
