import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '@/api/http'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)

    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { email, newPassword },
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置密码失败')
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-center">
              <div className="mb-4 text-2xl">✓</div>
              <div className="mb-2 font-semibold">密码重置成功</div>
              <p className="mb-4 text-sm text-zinc-500">请使用新密码登录</p>
              <Button onClick={() => navigate('/auth')}>返回登录</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/auth" className="text-sm text-zinc-600 hover:text-zinc-900">
            返回登录
          </Link>
          <div className="text-sm font-semibold">重置密码</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-zinc-500">
            输入您的注册邮箱和新密码，即可重置密码。
          </p>

          {error ? (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="邮箱" required>
              <Input
                full
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu.cn"
              />
            </Field>
            <Field label="新密码" required hint="6-20位字符">
              <Input
                full
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
                type="password"
              />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? '处理中…' : '重置密码'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}