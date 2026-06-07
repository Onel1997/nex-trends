import { memo } from 'react'
import { cn } from '@/lib'

type TrendScoreStripProps = {
  momentum?: number
  competition?: number
  opportunity?: number
  compact?: boolean
  className?: string
}

function scoreTone(value: number, invert = false): string {
  const v = invert ? 100 - value : value
  if (v >= 75) return 'text-emerald-400'
  if (v >= 55) return 'text-violet-400'
  return 'text-amber-400'
}

function TrendScoreStripInner({
  momentum = 0,
  competition = 0,
  opportunity = 0,
  compact = false,
  className,
}: TrendScoreStripProps) {
  const scores = [
    { label: 'Momentum', value: momentum, invert: false },
    { label: 'Competition', value: competition, invert: true },
    { label: 'Opportunity', value: opportunity, invert: false },
  ] as const

  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-1.5 rounded-xl border border-zinc-800/45 bg-zinc-950/50 p-2',
        compact && 'gap-1 p-1.5',
        className,
      )}
    >
      {scores.map(({ label, value, invert }) => (
        <div key={label} className="min-w-0 text-center">
          <p
            className={cn(
              'font-semibold tabular-nums',
              compact ? 'text-xs' : 'text-sm',
              scoreTone(value, invert),
            )}
          >
            {value}
          </p>
          <p className={cn('truncate text-zinc-600', compact ? 'text-[8px]' : 'text-[9px]')}>
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

export const TrendScoreStrip = memo(TrendScoreStripInner)
