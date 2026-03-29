import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import { apiRequest, uploadFiles } from '@/api/http'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { useAuthStore } from '@/stores/authStore'

export default function Publish() {
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [conditionLevel, setConditionLevel] = useState('九成新')
  const [category, setCategory] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)
    try {
      const urls = await uploadFiles(files, token)
      setImageUrls((prev) => [...prev, ...urls])
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-base font-semibold">发布商品</div>
        <div className="mt-1 text-sm text-zinc-500">提交后进入“待审核”，管理员审核通过后上架</div>

        {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <div className="mt-5 space-y-4">
          <Field label="标题" required>
            <Input full value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如 高数教材 / 蓝牙耳机" />
          </Field>
          <Field label="描述" required>
            <Textarea full value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要描述成色、使用情况、配件等" />
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="价格" required>
              <Input full value={price} onChange={(e) => setPrice(e.target.value)} placeholder="例如 35.5" />
            </Field>
            <Field label="成色" required>
              <select
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
                value={conditionLevel}
                onChange={(e) => setConditionLevel(e.target.value)}
              >
                <option value="全新">全新</option>
                <option value="九成新">九成新</option>
                <option value="八成新">八成新</option>
                <option value="七成新">七成新</option>
              </select>
            </Field>
          </div>
          <Field label="分类" required>
            <Input full value={category} onChange={(e) => setCategory(e.target.value)} placeholder="例如 教材 / 数码 / 生活" />
          </Field>
          <Field label="商品图片" required hint="支持上传多张图片">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, index) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border border-zinc-200">
                    <img
                      src={url.startsWith('/') ? url : url}
                      alt={`图片 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? '上传中...' : '选择图片'}
                </Button>
                {imageUrls.length === 0 && (
                  <span className="text-sm text-zinc-500">请至少上传一张图片</span>
                )}
              </div>
            </div>
          </Field>
          <Button
            className="w-full"
            disabled={busy || uploading || imageUrls.length === 0}
            onClick={async () => {
              setError(null)
              if (imageUrls.length === 0) {
                setError('请至少上传一张图片')
                return
              }

              setBusy(true)
              try {
                await apiRequest('/api/items', {
                  method: 'POST',
                  token,
                  body: {
                    title: title.trim(),
                    description: description.trim(),
                    price: price.trim(),
                    conditionLevel: conditionLevel.trim(),
                    category: category.trim(),
                    imageUrls: imageUrls.join(','),
                  },
                })
                navigate('/')
              } catch (e) {
                setError(e instanceof Error ? e.message : '发布失败')
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? '提交中…' : '提交发布'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-semibold">预览</div>
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
          <div className="h-40 bg-zinc-100">
            {imageUrls.length > 0 ? (
              <img
                src={imageUrls[0]}
                alt="商品图片"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                暂无图片
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="text-sm font-semibold">{title || '商品标题'}</div>
            <div className="mt-1 text-xs text-zinc-500">{category || '分类'} · {conditionLevel}</div>
            <div className="mt-3 text-base font-semibold">¥ {price || '0.00'}</div>
            <div className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-700">
              {description || '商品描述…'}
            </div>
          </div>
        </div>
        {imageUrls.length > 1 && (
          <div className="mt-2 flex gap-1">
            {imageUrls.slice(1, 4).map((url, i) => (
              <div key={url} className="h-12 w-12 overflow-hidden rounded border border-zinc-200">
                <img src={url} alt={`图片 ${i + 2}`} className="h-full w-full object-cover" />
              </div>
            ))}
            {imageUrls.length > 4 && (
              <div className="h-12 w-12 flex items-center justify-center rounded border border-zinc-200 text-xs text-zinc-500">
                +{imageUrls.length - 4}
              </div>
            )}
          </div>
        )}
        <div className="mt-4 text-xs text-zinc-500">提示：如果后端校验失败，会在此页显示错误信息。</div>
      </div>
    </div>
  )
}

