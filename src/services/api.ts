import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

export const startConversation = (name: string, email: string) =>
  api.post('/chat/start', { name, email })

export const sendMessage = (conversationId: string, message: string, userId: number) =>
  api.post('/chat/message', { conversationId, message, userId })

export const getTickets = (params?: Record<string, string>) =>
  api.get('/tickets', { params })

export const getTicketById = (id: string) =>
  api.get(`/tickets/${id}`)

export const updateTicket = (id: string, data: { status: string; assigned_to: string }) =>
  api.patch(`/tickets/${id}`, data)

export const getStats = () =>
  api.get('/tickets/stats')
