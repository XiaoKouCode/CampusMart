import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiRequest } from '@/api/http'
import type { ItemResponse, Page } from '@/api/types'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import StatusPill from '@/components/ui/StatusPill'

function toCover(imageUrls: string) {
  const first = imageUrls
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)[0]
  return first || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=campus%20secondhand%20item%20photo%2C%20clean%20product%20shot%2C%20soft%20light%2C%20neutral%20background%2C%20high%20detail%2C%20professional%20photography&image_size=square'
}

function statusLabel(status: string) {
  if (status === 'ONLINE') return { text: '在售', tone: 'success' as const }
  if (status === 'PENDING_REVIEW') return { text: '待审核', tone: 'warn' as const }
  if (status === 'SOLD') return { text: '已售出', tone: 'neutral' as const }
  return { text: '已下架', tone: 'danger' as const }
}

export default function Home() {
  const [params, setParams] = useSearchParams()

  const [keyword, setKeyword] = useState(params.get('keyword') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [minPrice, setMinPrice] = useState(params.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '')

  const page = Number(params.get('page') ?? '0')
  const size = Number(params.get('size') ?? '12')
  const sortBy = params.get('sortBy') ?? 'createdAt'

  const [data, setData] = useState<Page<ItemResponse> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    apiRequest<Page<ItemResponse>>('/api/items', {
      query: {
        keyword: params.get('keyword') ?? undefined,
        category: params.get('category') ?? undefined,
        minPrice: params.get('minPrice') ?? undefined,
        maxPrice: params.get('maxPrice') ?? undefined,
        page,
        size,
        sortBy,
      },
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
  }, [params, page, size, sortBy])

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold">商品浏览</div>
            <div className="mt-1 text-sm text-zinc-500">支持关键词、分类、价格区间筛选</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field label="关键词">
            <Input full value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例如 教材 / 耳机" />
          </Field>
          <Field label="分类">
            <Input full value={category} onChange={(e) => setCategory(e.target.value)} placeholder="例如 教材 / 数码" />
          </Field>
          <Field label="最低价">
            <Input full value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
          </Field>
          <Field label="最高价">
            <Input full value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999" />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setParams({
                keyword: keyword || '',
                category: category || '',
                minPrice: minPrice || '',
                maxPrice: maxPrice || '',
                page: '0',
                size: String(size),
                sortBy,
              })
            }}
          >
            查询
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setKeyword('')
              setCategory('')
              setMinPrice('')
              setMaxPrice('')
              setParams({ page: '0', size: String(size), sortBy })
            }}
          >
            重置
          </Button>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-zinc-500">排序</span>
            <select
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm"
              value={sortBy}
              onChange={(e) => setParams({ ...Object.fromEntries(params.entries()), sortBy: e.target.value })}
            >
              <option value="createdAt">最新发布</option>
              <option value="price">价格</option>
            </select>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {data?.content?.length ? (
            data.content.map((it) => {
              const st = statusLabel(it.status)
              return (
                <Link
                  to={`/items/${it.id}`}
                  key={it.id}
                  className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md"
                >
                  <div className="relative">
                    <img src={toCover(it.imageUrls)} alt={it.title} className="h-36 w-full object-cover" />
                    <div className="absolute left-3 top-3">
                      <StatusPill text={st.text} tone={st.tone} />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="line-clamp-1 text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">
                      {it.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">{it.category} · {it.conditionLevel}</div>
                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-base font-semibold text-zinc-900">¥ {it.price}</div>
                      <div className="text-xs text-zinc-500">{it.sellerNickname} · 信用 {it.sellerCredit}</div>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
              暂无商品，试试调整筛选条件或登录后发布
            </div>
          )}
        </div>
      )}

      {data ? (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
          <div className="text-zinc-600">
            共 {data.totalElements} 条 · 第 {data.number + 1} / {Math.max(1, data.totalPages)} 页
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={data.first}
              onClick={() => setParams({ ...Object.fromEntries(params.entries()), page: String(Math.max(0, page - 1)) })}
            >
              上一页
            </Button>
            <Button
              variant="secondary"
              disabled={data.last}
              onClick={() => setParams({ ...Object.fromEntries(params.entries()), page: String(page + 1) })}
            >
              下一页
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
