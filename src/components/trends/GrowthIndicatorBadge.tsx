import { cn } from '@/lib'
import { TrendingUpIcon } from '@/components/ui/icons'
import type { GrowthIndicator } from '@/types/trend-intelligence'

const META: Record<
  GrowthIndicator,
  { label: string; icon: string; className: string }
> = {
  up: {
    label: 'Wachstum',
    icon: '↑',
    className: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
  },
  stable: {
    label: 'Stabil',
    icon: '→',
    className: 'text-zinc-300 bg-zinc-500/10 ring-zinc-500/20',
  },
  down: {
    label: 'Rückgang',
    icon: '↓',
    className: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  },
}

type GrowthIndicatorBadgeProps = {
  indicator: GrowthIndicator
  compact?: boolean
  className?: string
}

export function GrowthIndicatorBadge({
  indicator,
  compact = false,
  className,
}: GrowthIndicatorBadgeProps) {
  const meta = META[indicator]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]',
        meta.className,
        className,
      )}
    >
      {indicator === 'up' ? (
        <TrendingUpIcon className={compact ? 'size-2.5' : 'size-3'} aria-hidden />
      ) : (
        <span aria-hidden>{meta.icon}</span>
      )}
      {meta.label}
    </span>
  )
}
