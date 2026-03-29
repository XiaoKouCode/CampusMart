import { cn } from '@/lib/utils'

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { full?: boolean },
) {
  const { className, full, ...rest } = props
  return (
    <input
      className={cn(
        'h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400',
        full ? 'w-full' : '',
        className,
      )}
      {...rest}
    />
  )
}

