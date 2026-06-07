import { cn } from '@/lib'

type ProgressBarProps = {
  value: number
  max?: number
  className?: string
  barClassName?: string
  label?: string
  /** When true, bar reflects remaining credits (full = all left). Default shows used amount. */
  mode?: 'used' | 'remaining'
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  label,
  mode = 'used',
}: ProgressBarProps) {
  const safeMax = Math.max(max, 1)
  const rawPercent =
    mode === 'remaining'
      ? Math.round((value / safeMax) * 100)
      : Math.min(100, Math.round((value / safeMax) * 100))

  const isEmpty = mode === 'remaining' && value <= 0
  let fillPercent = rawPercent
  if (isEmpty) fillPercent = 10
  else if (mode === 'remaining' && fillPercent > 0 && fillPercent < 12) fillPercent = 12

  return (
    <div className={className}>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-violet-950/70 ring-1 ring-inset ring-violet-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-700 ease-out',
            isEmpty && 'animate-pulse',
            barClassName,
          )}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  )
}
