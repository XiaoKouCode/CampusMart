import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'

export default function AdminLogin() {
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const busy = useAuthStore((s) => s.busy)
  const error = useAuthStore((s) => s.error)
  const navigate = useNavigate()

  const [email, setEmail] = useState('admin@campus.edu.cn')
  const [password, setPassword] = useState('Admin@123')
  const [localError, setLocalError] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-sm text-zinc-600 hover:text-zinc-900">
            返回首页
          </Link>
          <div className="text-sm font-semibold">管理员登录</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          {localError ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{localError}</div> : null}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              setLocalError(null)
              await login(email, password)
              if (!useAuthStore.getState().isAdmin()) {
                logout()
                setLocalError('该账号不是管理员，无权进入后台')
                return
              }
              navigate('/admin', { replace: true })
            }}
          >
            <Field label="邮箱" required>
              <Input full value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="密码" required>
              <Input full value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </Field>
            <Button className="w-full" type="submit" disabled={busy}>
              {busy ? '登录中…' : '登录后台'}
            </Button>
          </form>
          <div className="mt-4 text-xs text-zinc-500">默认账号：admin@campus.edu.cn / Admin@123</div>
        </div>
      </div>
    </div>
  )
}
