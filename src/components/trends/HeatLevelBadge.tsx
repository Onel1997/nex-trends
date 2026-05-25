import { cn } from '@/lib'
import { HEAT_META } from '@/lib/trend-intelligence'
import { FlameIcon } from '@/components/ui/icons'
import type { HeatLevel } from '@/types/trend-intelligence'

type HeatLevelBadgeProps = {
  level: HeatLevel
  compact?: boolean
  className?: string
}

export function HeatLevelBadge({ level, compact = false, className }: HeatLevelBadgeProps) {
  const meta = HEAT_META[level]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset',
        compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]',
        meta.className,
        className,
      )}
    >
      <FlameIcon className={compact ? 'size-2.5' : 'size-3'} aria-hidden />
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'size-1 rounded-full',
              i < meta.dots ? 'bg-current opacity-100' : 'bg-current opacity-20',
            )}
          />
        ))}
      </span>
      {meta.label}
    </span>
  )
}
