import { cn } from '@/lib/utils'

export default function StatusPill({
  text,
  tone,
}: {
  text: string
  tone?: 'neutral' | 'success' | 'warn' | 'danger'
}) {
  const cls: Record<NonNullable<typeof tone>, string> = {
    neutral: 'bg-zinc-100 text-zinc-700',
    success: 'bg-emerald-50 text-emerald-700',
    warn: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', cls[tone ?? 'neutral'])}>
      {text}
    </span>
  )
}

