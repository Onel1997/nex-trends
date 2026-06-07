import { memo } from 'react'
import { cn } from '@/lib'
import { TREND_STATUS_V2_META } from '@/lib/trend-v2'
import type { TrendStatusV2 } from '@/types/trend-v2'

type TrendStatusBadgeV2Props = {
  status: TrendStatusV2
  className?: string
  size?: 'sm' | 'md'
}

function TrendStatusBadgeV2Inner({ status, className, size = 'sm' }: TrendStatusBadgeV2Props) {
  const meta = TREND_STATUS_V2_META[status]

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

export const TrendStatusBadgeV2 = memo(TrendStatusBadgeV2Inner)
