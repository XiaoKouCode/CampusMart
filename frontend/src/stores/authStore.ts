import { create } from 'zustand'
import type {
  AuthResponse,
  Role,
  UpdateProfileRequest,
  UserProfileResponse,
} from '@/api/types'
import { apiRequest, HttpError } from '@/api/http'
import { rolesFromToken } from '@/utils/jwt'

type AuthState = {
  token: string | null
  roles: Role[]
  me: UserProfileResponse | null
  busy: boolean
  error: string | null
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    studentNo: string
    nickname: string
    email: string
    phone: string
    password: string
  }) => Promise<void>
  refreshMe: () => Promise<void>
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>
  logout: () => void
  isAuthed: () => boolean
  isAdmin: () => boolean
}

const LS_KEY = 'campus_trade_token'

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  roles: [],
  me: null,
  busy: false,
  error: null,

  bootstrap: async () => {
    const token = window.localStorage.getItem(LS_KEY)
    if (!token) return
    set({ token, roles: rolesFromToken(token) })
    try {
      await get().refreshMe()
    } catch {
      get().logout()
    }
  },

  login: async (email, password) => {
    set({ busy: true, error: null })
    try {
      const data = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      window.localStorage.setItem(LS_KEY, data.token)
      set({ token: data.token, roles: rolesFromToken(data.token) })
      await get().refreshMe()
      set({ busy: false })
    } catch (e) {
      const msg = e instanceof HttpError ? e.message : '登录失败'
      set({ busy: false, error: msg })
      throw e
    }
  },

  register: async (payload) => {
    set({ busy: true, error: null })
    try {
      const data = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: payload,
      })
      window.localStorage.setItem(LS_KEY, data.token)
      set({ token: data.token, roles: rolesFromToken(data.token) })
      await get().refreshMe()
      set({ busy: false })
    } catch (e) {
      const msg = e instanceof HttpError ? e.message : '注册失败'
      set({ busy: false, error: msg })
      throw e
    }
  },

  refreshMe: async () => {
    const token = get().token
    if (!token) throw new HttpError(401, '未登录')
    const me = await apiRequest<UserProfileResponse>('/api/users/me', { token })
    set({ me })
  },

  updateProfile: async (payload) => {
    const token = get().token
    if (!token) throw new HttpError(401, '未登录')
    set({ busy: true, error: null })
    try {
      const me = await apiRequest<UserProfileResponse>('/api/users/me', {
        method: 'PATCH',
        token,
        body: payload,
      })
      set({ me, busy: false })
    } catch (e) {
      const msg = e instanceof HttpError ? e.message : '更新失败'
      set({ busy: false, error: msg })
      throw e
    }
  },

  logout: () => {
    window.localStorage.removeItem(LS_KEY)
    set({ token: null, roles: [], me: null, busy: false, error: null })
  },

  isAuthed: () => Boolean(get().token),
  isAdmin: () => get().roles.includes('ADMIN'),
}))

