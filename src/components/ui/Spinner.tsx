import { cn } from '@/lib'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizes = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-12',
}

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <SpinnerInline size={size} />
      {label && <span className="text-sm text-zinc-500">{label}</span>}
    </div>
  )
}

export function SpinnerInline({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <span className={cn('relative inline-block', sizes[size], className)} aria-hidden>
      <span className="absolute inset-0 rounded-full border-2 border-zinc-800/80" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500 border-r-fuchsia-500/80" />
    </span>
  )
}
