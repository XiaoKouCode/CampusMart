import { cn } from '@/lib/utils'

export default function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-800">
        <span>{label}</span>
        {required ? <span className="text-xs text-red-600">*</span> : null}
        {hint ? <span className="text-xs font-normal text-zinc-500">{hint}</span> : null}
      </div>
      <div className={cn('w-full')}>{children}</div>
    </label>
  )
}

