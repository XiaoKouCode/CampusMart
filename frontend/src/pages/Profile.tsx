import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'

export default function Profile() {
  const me = useAuthStore((s) => s.me)
  const refreshMe = useAuthStore((s) => s.refreshMe)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const busy = useAuthStore((s) => s.busy)
  const error = useAuthStore((s) => s.error)

  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    if (!me) return
    setNickname(me.nickname)
    setPhone(me.phone ?? '')
    setAvatarUrl(me.avatarUrl ?? '')
  }, [me])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-1">
        <div className="text-base font-semibold">个人信息</div>
        <div className="mt-1 text-sm text-zinc-500">账号与信用信息</div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">学号</span>
            <span className="font-medium">{me?.studentNo ?? '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">邮箱</span>
            <span className="font-medium">{me?.email ?? '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">实名</span>
            <span className="font-medium">{me?.verified ? '已通过' : '未通过'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">信用分</span>
            <span className="font-medium">{me?.creditScore ?? '-'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2">
        <div className="text-base font-semibold">编辑资料</div>
        <div className="mt-1 text-sm text-zinc-500">修改昵称、头像与手机号</div>

        {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {saved ? <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">已保存</div> : null}

        <div className="mt-5 space-y-4">
          <Field label="昵称" required>
            <Input full value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </Field>
          <Field label="手机号">
            <Input full value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="可选" />
          </Field>
          <Field label="头像URL">
            <Input full value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="可选" />
          </Field>
          <div className="flex justify-end">
            <Button
              disabled={busy}
              onClick={async () => {
                setSaved(false)
                await updateProfile({
                  nickname: nickname.trim(),
                  phone: phone.trim() || null,
                  avatarUrl: avatarUrl.trim() || null,
                })
                setSaved(true)
              }}
            >
              {busy ? '保存中…' : '保存'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

