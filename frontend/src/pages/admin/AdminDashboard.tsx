import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '@/api/http'
import type { ItemResponse, ItemStatus, Page, ReportStatus } from '@/api/types'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import StatusPill from '@/components/ui/StatusPill'
import { useAuthStore } from '@/stores/authStore'

function statusTone(status: ItemStatus) {
  if (status === 'ONLINE') return { text: '在售', tone: 'success' as const }
  if (status === 'PENDING_REVIEW') return { text: '待审核', tone: 'warn' as const }
  if (status === 'SOLD') return { text: '已售出', tone: 'neutral' as const }
  return { text: '已下架', tone: 'danger' as const }
}

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token)
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [statsErr, setStatsErr] = useState<string | null>(null)

  const [itemStatus, setItemStatus] = useState<ItemStatus>('PENDING_REVIEW')
  const [items, setItems] = useState<Page<ItemResponse> | null>(null)
  const [itemsErr, setItemsErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [userId, setUserId] = useState('')
  const [userEnabled, setUserEnabled] = useState(true)
  const [userResult, setUserResult] = useState<string | null>(null)

  const [reportId, setReportId] = useState('')
  const [reportStatus, setReportStatus] = useState<ReportStatus>('RESOLVED')
  const [reportRemark, setReportRemark] = useState('')
  const [reportResult, setReportResult] = useState<string | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<ItemResponse | null>(null)

  const statusOptions = useMemo(
    () => [
      { value: 'PENDING_REVIEW' as const, label: '待审核' },
      { value: 'ONLINE' as const, label: '在售' },
      { value: 'OFFLINE' as const, label: '已下架' },
      { value: 'SOLD' as const, label: '已售出' },
    ],
    [],
  )

  useEffect(() => {
    apiRequest<Record<string, number>>('/api/admin/stats', { token })
      .then(setStats)
      .catch((e: unknown) => setStatsErr(e instanceof Error ? e.message : '加载失败'))
  }, [token])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setItemsErr(null)
    apiRequest<Page<ItemResponse>>('/api/admin/items', {
      token,
      query: { status: itemStatus, page, size: 10 },
    })
      .then((d) => {
        if (!alive) return
        setItems(d)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setItemsErr(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [token, itemStatus, page])

  async function refreshItems() {
    const d = await apiRequest<Page<ItemResponse>>('/api/admin/items', {
      token,
      query: { status: itemStatus, page, size: 10 },
    })
    setItems(d)
  }

  async function itemAct(id: number, action: 'approve' | 'offline') {
    setBusyId(id)
    try {
      await apiRequest(`/api/admin/items/${id}/${action}`, { method: 'PATCH', token })
      await refreshItems()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-base font-semibold">管理后台</div>
        <div className="mt-1 text-sm text-zinc-500">统计概览、商品审核/下架、用户状态与举报处理</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">用户数</div>
          <div className="mt-2 text-2xl font-semibold">{stats?.users ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">商品数</div>
          <div className="mt-2 text-2xl font-semibold">{stats?.items ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">订单数</div>
          <div className="mt-2 text-2xl font-semibold">{stats?.orders ?? '-'}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">举报数</div>
          <div className="mt-2 text-2xl font-semibold">{stats?.reports ?? '-'}</div>
        </div>
      </div>
      {statsErr ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{statsErr}</div> : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">商品审核 / 下架</div>
            <div className="mt-1 text-xs text-zinc-500">按状态拉取商品列表，对待审核商品进行审核</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-600">状态</div>
            <select
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              value={itemStatus}
              onChange={(e) => {
                setItemStatus(e.target.value as ItemStatus)
                setPage(0)
              }}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {itemsErr ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{itemsErr}</div> : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
          <div className="grid grid-cols-12 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-600">
            <div className="col-span-6">商品</div>
            <div className="col-span-2">价格</div>
            <div className="col-span-2">状态</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          {loading ? (
            <div className="p-4">
              <div className="h-32 animate-pulse rounded-lg bg-zinc-100" />
            </div>
          ) : items?.content?.length ? (
            items.content.map((it) => {
              const st = statusTone(it.status)
              return (
                <div key={it.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm hover:bg-zinc-50">
                  <div className="col-span-6">
                    <button
                      className="text-left font-medium text-zinc-900 hover:underline"
                      onClick={() => {
                        setPreviewItem(it)
                        setPreviewOpen(true)
                      }}
                    >
                      {it.title}
                    </button>
                    <div className="mt-1 text-xs text-zinc-500">#{it.id} · {it.sellerNickname}（信用 {it.sellerCredit}）</div>
                  </div>
                  <div className="col-span-2 font-medium">¥ {it.price}</div>
                  <div className="col-span-2">
                    <StatusPill text={st.text} tone={st.tone} />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    {it.status === 'PENDING_REVIEW' ? (
                      <Button disabled={busyId === it.id} onClick={() => itemAct(it.id, 'approve')}>
                        审核通过
                      </Button>
                    ) : null}
                    {it.status === 'ONLINE' ? (
                      <Button variant="danger" disabled={busyId === it.id} onClick={() => itemAct(it.id, 'offline')}>
                        下架
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-6 py-10 text-center text-sm text-zinc-500">暂无数据</div>
          )}
        </div>

        {items ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-zinc-600">
              共 {items.totalElements} 条 · 第 {items.number + 1} / {Math.max(1, items.totalPages)} 页
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" disabled={items.first} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                上一页
              </Button>
              <Button variant="secondary" disabled={items.last} onClick={() => setPage((p) => p + 1)}>
                下一页
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-semibold">用户状态</div>
          <div className="mt-1 text-xs text-zinc-500">后端暂未提供用户列表，此处按用户ID操作</div>
          {userResult ? <div className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{userResult}</div> : null}
          <div className="mt-4 space-y-4">
            <Field label="用户ID" required>
              <Input full value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="例如 1" />
            </Field>
            <div className="flex items-center gap-3">
              <input
                id="enabled"
                type="checkbox"
                checked={userEnabled}
                onChange={(e) => setUserEnabled(e.target.checked)}
              />
              <label htmlFor="enabled" className="text-sm text-zinc-700">
                启用账号
              </label>
            </div>
            <Button
              onClick={async () => {
                setUserResult(null)
                const id = Number(userId)
                if (!id) {
                  setUserResult('请输入正确的用户ID')
                  return
                }
                await apiRequest(`/api/admin/users/${id}/status`, {
                  method: 'PATCH',
                  token,
                  query: { enabled: userEnabled },
                })
                setUserResult('用户状态更新成功')
              }}
            >
              提交
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-semibold">举报处理</div>
          <div className="mt-1 text-xs text-zinc-500">后端暂未提供举报列表，此处按举报ID处理</div>
          {reportResult ? <div className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{reportResult}</div> : null}
          <div className="mt-4 space-y-4">
            <Field label="举报ID" required>
              <Input full value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="例如 1" />
            </Field>
            <Field label="处理状态" required>
              <select
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
                value={reportStatus}
                onChange={(e) => setReportStatus(e.target.value as ReportStatus)}
              >
                <option value="OPEN">OPEN</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </Field>
            <Field label="备注">
              <Textarea full value={reportRemark} onChange={(e) => setReportRemark(e.target.value)} placeholder="可选" />
            </Field>
            <Button
              onClick={async () => {
                setReportResult(null)
                const id = Number(reportId)
                if (!id) {
                  setReportResult('请输入正确的举报ID')
                  return
                }
                await apiRequest(`/api/admin/reports/${id}`, {
                  method: 'PATCH',
                  token,
                  query: { status: reportStatus, remark: reportRemark.trim() || undefined },
                })
                setReportResult('举报处理完成')
              }}
            >
              提交
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={previewOpen}
        title="商品详情预览"
        onClose={() => {
          setPreviewOpen(false)
          setPreviewItem(null)
        }}
        className="max-w-2xl"
      >
        {previewItem ? (
          <div className="space-y-2">
            <div className="text-base font-semibold">{previewItem.title}</div>
            <div className="text-sm text-zinc-600">¥ {previewItem.price} · {previewItem.category} · {previewItem.conditionLevel}</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{previewItem.description}</div>
            <div className="mt-3 text-xs text-zinc-500">图片：{previewItem.imageUrls}</div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

