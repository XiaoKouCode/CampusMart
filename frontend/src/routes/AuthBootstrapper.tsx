import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export default function AuthBootstrapper() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  useEffect(() => {
    bootstrap()
  }, [bootstrap])
  return null
}

