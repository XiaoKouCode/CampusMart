import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, MessageSquare, ShoppingCart } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '@/api/http'
import type { ItemResponse } from '@/api/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import StatusPill from '@/components/ui/StatusPill'
import { useAuthStore } from '@/stores/authStore'

function parseImages(imageUrls: string) {
  const list = imageUrls
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (list.length) return list
  return [
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=campus%20secondhand%20item%2C%20clean%20product%20photo%2C%20soft%20light%2C%20neutral%20background%2C%20high%20detail&image_size=square_hd',
  ]
}

function itemStatusBadge(status: string) {
  if (status === 'ONLINE') return { text: '在售', tone: 'success' as const }
  if (status === 'PENDING_REVIEW') return { text: '待审核', tone: 'warn' as const }
  if (status === 'SOLD') return { text: '已售出', tone: 'neutral' as const }
  return { text: '已下架', tone: 'danger' as const }
}

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const isAuthed = useAuthStore((s) => s.isAuthed())

  const [data, setData] = useState<ItemResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoading(true)
    setError(null)
    apiRequest<ItemResponse>(`/api/items/${id}`)
      .then((d) => {
        if (!alive) return
        setData(d)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id])

  const imgs = useMemo(() => (data ? parseImages(data.imageUrls) : []), [data])
  const badge = data ? itemStatusBadge(data.status) : null
  const canBuy = Boolean(data && data.status === 'ONLINE')

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-white" />
  }
  if (error) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
  }
  if (!data) return null

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <img src={imgs[0]} alt={data.title} className="h-[420px] w-full object-cover" />
          </div>
          {imgs.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {imgs.slice(0, 4).map((src) => (
                <img key={src} src={src} alt="" className="h-24 w-full rounded-lg border border-zinc-200 object-cover" />
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{data.title}</div>
                <div className="mt-1 text-sm text-zinc-500">{data.category} · {data.conditionLevel}</div>
              </div>
              {badge ? <StatusPill text={badge.text} tone={badge.tone} /> : null}
            </div>

            <div className="mt-4 text-2xl font-semibold">¥ {data.price}</div>

            <div className="mt-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">卖家</span>
                <span className="font-medium">{data.sellerNickname}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-zinc-600">信用分</span>
                <span className="font-medium">{data.sellerCredit}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                disabled={!canBuy || busy}
                onClick={async () => {
                  if (!isAuthed) {
                    navigate(`/auth?redirect=${encodeURIComponent(`/items/${data.id}`)}`)
                    return
                  }
                  setBusy(true)
                  try {
                    await apiRequest(`/api/orders`, {
                      method: 'POST',
                      token,
                      body: { itemId: data.id },
                    })
                    navigate('/orders')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                立即下单
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (!isAuthed) {
                    navigate(`/auth?redirect=${encodeURIComponent(`/items/${data.id}`)}`)
                    return
                  }
                  navigate(`/chat/${data.sellerId}?itemId=${data.id}`)
                }}
              >
                <MessageSquare className="h-4 w-4" />
                联系卖家
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (!isAuthed) {
                    navigate(`/auth?redirect=${encodeURIComponent(`/items/${data.id}`)}`)
                    return
                  }
                  setReportOpen(true)
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                举报
              </Button>
              {!canBuy ? (
                <div className="text-xs text-zinc-500">该商品当前状态不可下单（{data.status}）</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">商品描述</div>
        <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{data.description}</div>
      </div>

      <Modal
        open={reportOpen}
        title="提交举报"
        onClose={() => {
          setReportOpen(false)
          setReportReason('')
        }}
      >
        <div className="space-y-3">
          <Textarea
            full
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="请描述举报原因（必填）"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setReportOpen(false)}>
              取消
            </Button>
            <Button
              disabled={!reportReason.trim() || busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await apiRequest('/api/reports', {
                    method: 'POST',
                    token,
                    body: { targetItemId: data.id, reason: reportReason.trim() },
                  })
                  setReportOpen(false)
                  setReportReason('')
                } finally {
                  setBusy(false)
                }
              }}
            >
              提交
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

