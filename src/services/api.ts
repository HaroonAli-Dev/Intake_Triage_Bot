import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password })

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const startConversation = () =>
  api.post('/chat/start')

export const sendMessage = (conversationId: string, message: string) =>
  api.post('/chat/message', { conversationId, message })

export const getTickets = (params?: Record<string, string>) =>
  api.get('/tickets', { params })

export const updateTicket = (id: string, data: { status: string; assigned_to: string }) =>
  api.patch(`/tickets/${id}`, data)

export const getStats = () =>
  api.get('/tickets/stats')
