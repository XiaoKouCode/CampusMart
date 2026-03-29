import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function RequireAuth() {
  const isAuthed = useAuthStore((s) => s.isAuthed())
  const location = useLocation()
  if (!isAuthed) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirect=${redirect}`} replace />
  }
  return <Outlet />
}

