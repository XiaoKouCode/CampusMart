import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function RequireAdmin() {
  const isAuthed = useAuthStore((s) => s.isAuthed())
  const isAdmin = useAuthStore((s) => s.isAdmin())
  if (!isAuthed) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

