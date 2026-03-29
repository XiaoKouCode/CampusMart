import type { Role } from '@/api/types'

function base64UrlToBase64(input: string) {
  const pad = '='.repeat((4 - (input.length % 4)) % 4)
  return input.replace(/-/g, '+').replace(/_/g, '/') + pad
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const json = atob(base64UrlToBase64(parts[1]))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function rolesFromToken(token: string): Role[] {
  const payload = decodeJwtPayload(token)
  const raw = payload?.roles
  if (typeof raw !== 'string' || !raw.trim()) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s): s is Role => s === 'STUDENT' || s === 'ADMIN')
}

