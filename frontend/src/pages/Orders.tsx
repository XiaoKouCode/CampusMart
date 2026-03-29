import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '@/api/http'
import type { CreateReviewRequest, OrderResponse, OrderStatus, Page, RatingLevel } from '@/api/types'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'

type View = 'buyer' | 'seller'

const buyerStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING_PAYMENT', label: '待支付' },
  { value: 'WAITING_BUYER_RECEIVE', label: '待收货' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELED', label: '已取消' },
]

const sellerStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'WAITING_SELLER_CONFIRM', label: '待确认' },
  { value: 'WAITING_BUYER_RECEIVE', label: '待买家收货' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELED', label: '已取消' },
]

function statusText(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    PENDING_PAYMENT: '待支付',
    FUNDS_HELD: '资金暂扣',
    WAITING_SELLER_CONFIRM: '待卖家确认',
    WAITING_BUYER_RECEIVE: '待买家收货',
    COMPLETED: '已完成',
    CANCELED: '已取消',
  }
  return map[status]
}

export default function Orders() {
  const token = useAuthStore((s) => s.token)
  const me = useAuthStore((s) => s.me)
  const navigate = useNavigate()
  const [view, setView] = useState<View>('buyer')
  const [status, setStatus] = useState<OrderStatus>('PENDING_PAYMENT')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<OrderResponse> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewOrder, setReviewOrder] = useState<OrderResponse | null>(null)
  const [reviewLevel, setReviewLevel] = useState<RatingLevel>('GOOD')
  const [reviewContent, setReviewContent] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const statusOptions = useMemo(() => (view === 'buyer' ? buyerStatusOptions : sellerStatusOptions), [view])

  useEffect(() => {
    setPage(0)
    setStatus(view === 'buyer' ? 'PENDING_PAYMENT' : 'WAITING_SELLER_CONFIRM')
  }, [view])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    const path = view === 'buyer' ? '/api/orders/buyer' : '/api/orders/seller'
    apiRequest<Page<OrderResponse>>(path, {
      token,
      query: { status, page, size: 10 },
    })
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
  }, [token, view, status, page])

  async function act(orderId: number, path: string) {
    setBusyId(orderId)
    try {
      await apiRequest(path, { method: 'PATCH', token })
      const refreshPath = view === 'buyer' ? '/api/orders/buyer' : '/api/orders/seller'
      const d = await apiRequest<Page<OrderResponse>>(refreshPath, { token, query: { status, page, size: 10 } })
      setData(d)
    } finally {
      setBusyId(null)
    }
  }

  async function submitReview(payload: CreateReviewRequest) {
    await apiRequest('/api/reviews', { method: 'POST', token, body: payload })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold">订单中心</div>
            <div className="mt-1 text-sm text-zinc-500">担保交易：支付暂扣 → 卖家确认 → 买家收货 → 完成</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={
                view === 'buyer'
                  ? 'h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white'
                  : 'h-10 rounded-md bg-zinc-100 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-200'
              }
              onClick={() => setView('buyer')}
            >
              我是买家
            </button>
            <button
              className={
                view === 'seller'
                  ? 'h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white'
                  : 'h-10 rounded-md bg-zinc-100 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-200'
              }
              onClick={() => setView('seller')}
            >
              我是卖家
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="text-sm text-zinc-600">状态</div>
          <select
            className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-600">
          <div className="col-span-5">商品</div>
          <div className="col-span-2">金额</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-3 text-right">操作</div>
        </div>
        {loading ? (
          <div className="p-4">
            <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
          </div>
        ) : data?.content?.length ? (
          data.content.map((o) => (
            <div key={o.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-50">
              <div className="col-span-5">
                <div className="font-medium text-zinc-900">{o.itemTitle}</div>
                <div className="mt-1 text-xs text-zinc-500">订单号 #{o.id}</div>
              </div>
              <div className="col-span-2 font-medium">¥ {o.amount}</div>
              <div className="col-span-2 text-zinc-700">{statusText(o.status)}</div>
              <div className="col-span-3 flex justify-end gap-2">
                {view === 'buyer' && o.status === 'PENDING_PAYMENT' ? (
                  <>
                    <Button variant="secondary" disabled={busyId === o.id} onClick={() => act(o.id, `/api/orders/${o.id}/cancel`)}>
                      取消
                    </Button>
                    <Button disabled={busyId === o.id} onClick={() => act(o.id, `/api/orders/${o.id}/pay`)}>
                      支付
                    </Button>
                  </>
                ) : null}

                {view === 'seller' && o.status === 'WAITING_SELLER_CONFIRM' ? (
                  <Button disabled={busyId === o.id} onClick={() => act(o.id, `/api/orders/${o.id}/seller-confirm`)}>
                    确认交易
                  </Button>
                ) : null}

                {view === 'buyer' && o.status === 'WAITING_BUYER_RECEIVE' ? (
                  <Button disabled={busyId === o.id} onClick={() => act(o.id, `/api/orders/${o.id}/buyer-receive`)}>
                    确认收货
                  </Button>
                ) : null}

                {view === 'buyer' && o.status === 'COMPLETED' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReviewOrder(o)
                      setReviewLevel('GOOD')
                      setReviewContent('')
                      setReviewOpen(true)
                    }}
                  >
                    评价
                  </Button>
                ) : null}

                <Button
                  variant="secondary"
                  onClick={() => {
                    const peer = view === 'buyer' ? o.sellerId : o.buyerId
                    navigate(`/chat/${peer}?itemId=${o.itemId}`)
                  }}
                >
                  聊天
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-10 text-center text-sm text-zinc-500">当前筛选条件下暂无订单</div>
        )}
      </div>

      {data ? (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
          <div className="text-zinc-600">
            共 {data.totalElements} 条 · 第 {data.number + 1} / {Math.max(1, data.totalPages)} 页
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={data.first} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              上一页
            </Button>
            <Button variant="secondary" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
              下一页
            </Button>
          </div>
        </div>
      ) : null}

      <Modal
        open={reviewOpen}
        title="提交评价"
        onClose={() => {
          setReviewOpen(false)
          setReviewOrder(null)
        }}
      >
        <div className="space-y-3">
          <div className="text-sm text-zinc-700">
            订单 #{reviewOrder?.id} · {reviewOrder?.itemTitle}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-600">等级</div>
            <select
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              value={reviewLevel}
              onChange={(e) => setReviewLevel(e.target.value as RatingLevel)}
            >
              <option value="GOOD">好评</option>
              <option value="NEUTRAL">中评</option>
              <option value="BAD">差评</option>
            </select>
          </div>
          <Textarea full value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="写下你的评价（必填）" />
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setReviewOpen(false)}>
              取消
            </Button>
            <Button
              disabled={!reviewOrder || !reviewContent.trim()}
              onClick={async () => {
                if (!reviewOrder || !me) return
                await submitReview({ orderId: reviewOrder.id, level: reviewLevel, content: reviewContent.trim() })
                setReviewOpen(false)
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
