import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'

type Tab = 'login' | 'register'

export default function Auth() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect')
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('login')
  const busy = useAuthStore((s) => s.busy)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [studentNo, setStudentNo] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const target = useMemo(() => {
    if (!redirect) return '/'
    try {
      return decodeURIComponent(redirect)
    } catch {
      return '/'
    }
  }, [redirect])

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-sm text-zinc-600 hover:text-zinc-900">
            返回首页
          </Link>
          <div className="text-sm font-semibold">登录 / 注册</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              className={
                tab === 'login'
                  ? 'h-10 rounded-md bg-zinc-900 text-sm font-medium text-white'
                  : 'h-10 rounded-md bg-zinc-100 text-sm font-medium text-zinc-800 hover:bg-zinc-200'
              }
              onClick={() => setTab('login')}
            >
              登录
            </button>
            <button
              className={
                tab === 'register'
                  ? 'h-10 rounded-md bg-zinc-900 text-sm font-medium text-white'
                  : 'h-10 rounded-md bg-zinc-100 text-sm font-medium text-zinc-800 hover:bg-zinc-200'
              }
              onClick={() => setTab('register')}
            >
              注册
            </button>
          </div>

          {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          {tab === 'login' ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                await login(loginEmail, loginPassword)
                navigate(target, { replace: true })
              }}
            >
              <Field label="邮箱" required>
                <Input full value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="name@campus.edu.cn" />
              </Field>
              <Field label="密码" required>
                <Input
                  full
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="请输入密码"
                  type="password"
                />
              </Field>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? '处理中…' : '登录'}
              </Button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                await register({ studentNo, nickname, email, phone, password })
                navigate(target, { replace: true })
              }}
            >
              <Field label="学号" required>
                <Input full value={studentNo} onChange={(e) => setStudentNo(e.target.value)} placeholder="例如 20260001" />
              </Field>
              <Field label="昵称" required>
                <Input full value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="你的公开昵称" />
              </Field>
              <Field label="邮箱" required hint="后端会识别 .edu.cn 实名">
                <Input full value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@campus.edu.cn" />
              </Field>
              <Field label="手机号" required>
                <Input full value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11位手机号" />
              </Field>
              <Field label="密码" required>
                <Input full value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6-20位" type="password" />
              </Field>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? '处理中…' : '注册'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

