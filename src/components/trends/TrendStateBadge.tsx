import { memo } from 'react'
import { TREND_STATE_META } from '@/lib/trend-signals'
import type { TrendState } from '@/types/trend-intelligence'
import { cn } from '@/lib'

type TrendStateBadgeProps = {
  state: TrendState
  className?: string
  size?: 'sm' | 'md'
}

function TrendStateBadgeInner({ state, className, size = 'sm' }: TrendStateBadgeProps) {
  const meta = TREND_STATE_META[state]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]',
        meta.className,
        className,
      )}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  )
}

export const TrendStateBadge = memo(TrendStateBadgeInner)
