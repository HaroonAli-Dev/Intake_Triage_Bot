import { Navigate } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  role: 'user' | 'admin'
}

export default function ProtectedRoute({ children, role }: Props) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/chat'} replace />

  return <>{children}</>
}
