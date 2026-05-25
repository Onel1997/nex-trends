import type { ComponentType, ReactNode, SVGProps } from 'react'
import { cn } from '@/lib'

type DashboardSubsectionHeaderProps = {
  title: string
  count?: number
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  iconClassName?: string
  onViewAll?: () => void
  viewAllLabel?: string
  action?: ReactNode
  className?: string
}

export function DashboardSubsectionHeader({
  title,
  count,
  icon: Icon,
  iconClassName,
  onViewAll,
  viewAllLabel = 'View all',
  action,
  className,
}: DashboardSubsectionHeaderProps) {
  return (
    <div className={cn('mb-2 flex items-center justify-between gap-2', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? (
          <Icon
            className={cn('size-3.5 shrink-0 text-violet-400/70', iconClassName)}
            aria-hidden
          />
        ) : null}
        <h3 className="truncate text-[13px] font-semibold tracking-tight text-zinc-100">
          {title}
        </h3>
        {count !== undefined ? (
          <span className="shrink-0 rounded-full border border-zinc-700/80 bg-zinc-800/60 px-1.5 py-px text-[10px] font-medium tabular-nums text-zinc-400">
            {count}
          </span>
        ) : null}
      </div>
      {action}
      {onViewAll && !action ? (
        <button
          type="button"
          onClick={onViewAll}
          className="shrink-0 text-[11px] font-medium text-zinc-500 transition-smooth hover:text-violet-300"
        >
          {viewAllLabel} →
        </button>
      ) : null}
    </div>
  )
}
