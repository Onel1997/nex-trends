import { cn } from '@/lib'

type AiPulseIndicatorProps = {
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

export function AiPulseIndicator({
  label = 'Live',
  className,
  size = 'sm',
}: AiPulseIndicatorProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10',
        size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5',
        className,
      )}
    >
      <span className="relative flex size-2 items-center justify-center" aria-hidden>
        <span className="ai-pulse-ring absolute inset-0 rounded-full bg-emerald-400/50" />
        <span className="relative size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </span>
      {label ? (
        <span
          className={cn(
            'font-semibold uppercase tracking-wider text-emerald-300/95',
            size === 'sm' ? 'text-[9px]' : 'text-[10px]',
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}
