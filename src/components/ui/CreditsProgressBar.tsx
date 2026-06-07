import { cn } from '@/lib'

type CreditsProgressBarProps = {
  remaining: number
  limit: number
  className?: string
  size?: 'sm' | 'md'
  label?: string
}

export function CreditsProgressBar({
  remaining,
  limit,
  className,
  size = 'md',
  label,
}: CreditsProgressBarProps) {
  const safeLimit = Math.max(limit, 1)
  const isDepleted = remaining <= 0
  const ratio = Math.min(1, Math.max(0, remaining / safeLimit))

  let fillPercent = Math.round(ratio * 100)
  if (isDepleted) {
    fillPercent = 10
  } else if (fillPercent > 0 && fillPercent < 12) {
    fillPercent = 12
  }

  const heightClass = size === 'sm' ? 'h-2' : 'h-2.5'

  return (
    <div className={className}>
      <div
        className={cn(
          'overflow-hidden rounded-full bg-violet-950/70 ring-1 ring-inset ring-violet-500/25',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          heightClass,
        )}
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={safeLimit}
        aria-label={label ?? `${remaining} von ${safeLimit} Credits verbleibend`}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-400',
            'shadow-[0_0_12px_rgba(168,85,247,0.55)] transition-all duration-700 ease-out',
            isDepleted && 'animate-pulse from-fuchsia-600 via-violet-500 to-fuchsia-600',
          )}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  )
}
