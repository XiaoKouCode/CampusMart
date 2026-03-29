import type { ApiResponse } from '@/api/types'

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function joinUrl(base: string, path: string) {
  if (!base) return path
  if (base.endsWith('/') && path.startsWith('/')) return base.slice(0, -1) + path
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path
  return base + path
}

export async function apiRequest<T>(
  path: string,
  opts?: {
    method?: string
    token?: string | null
    query?: Record<string, string | number | boolean | null | undefined>
    body?: unknown
  },
): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const url = new URL(joinUrl(base, path), window.location.origin)
  if (opts?.query) {
    Object.entries(opts.query).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return
      url.searchParams.set(k, String(v))
    })
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`

  const resp = await fetch(url.toString(), {
    method: opts?.method ?? 'GET',
    headers,
    body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
  })

  let json: ApiResponse<T> | null = null
  try {
    json = (await resp.json()) as ApiResponse<T>
  } catch {
    json = null
  }

  if (!resp.ok) {
    const msg = json?.message || `请求失败(${resp.status})`
    throw new HttpError(resp.status, msg)
  }
  if (!json) throw new HttpError(resp.status, '响应解析失败')
  if (!json.success) throw new HttpError(resp.status, json.message || '请求失败')
  return json.data
}

export async function uploadFiles(
  files: FileList | File[],
  token: string | null,
): Promise<string[]> {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const url = new URL(joinUrl(base, '/api/upload'), window.location.origin)

  const formData = new FormData()
  Array.from(files).forEach((file) => {
    formData.append('files', file)
  })

  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: formData,
  })

  let json: ApiResponse<string[]> | null = null
  try {
    json = (await resp.json()) as ApiResponse<string[]>
  } catch {
    json = null
  }

  if (!resp.ok) {
    const msg = json?.message || `上传失败(${resp.status})`
    throw new HttpError(resp.status, msg)
  }
  if (!json) throw new HttpError(resp.status, '响应解析失败')
  if (!json.success) throw new HttpError(resp.status, json.message || '上传失败')
  return json.data
}

