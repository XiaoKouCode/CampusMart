import { cn } from '@/lib/utils'

export default function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { full?: boolean },
) {
  const { className, full, ...rest } = props
  return (
    <textarea
      className={cn(
        'min-h-24 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400',
        full ? 'w-full' : '',
        className,
      )}
      {...rest}
    />
  )
}

