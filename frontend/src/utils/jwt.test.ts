import { describe, expect, it } from 'vitest'
import { rolesFromToken } from '@/utils/jwt'

function tokenWithRoles(roles: string) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  const payload = btoa(JSON.stringify({ roles }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  return `${header}.${payload}.sig`
}

describe('rolesFromToken', () => {
  it('parses comma-separated roles', () => {
    expect(rolesFromToken(tokenWithRoles('STUDENT'))).toEqual(['STUDENT'])
    expect(rolesFromToken(tokenWithRoles('ADMIN,STUDENT'))).toEqual(['ADMIN', 'STUDENT'])
  })

  it('filters unknown roles', () => {
    expect(rolesFromToken(tokenWithRoles('ADMIN,UNKNOWN'))).toEqual(['ADMIN'])
  })
})

