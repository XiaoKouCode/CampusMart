import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  className?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
      <div className={cn('w-full max-w-lg rounded-xl bg-white shadow-xl', className)}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100"
            onClick={onClose}
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

