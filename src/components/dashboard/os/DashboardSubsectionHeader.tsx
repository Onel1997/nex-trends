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
    <div className={cn('mb-1 flex items-center justify-between gap-2', className)}>
      <div className="flex min-w-0 items-center gap-1.5">
        {Icon ? (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-violet-500/15 bg-violet-500/8">
            <Icon
              className={cn('size-3 text-violet-400/80', iconClassName)}
              aria-hidden
            />
          </span>
        ) : null}
        <h3 className="truncate text-[12px] font-semibold tracking-tight text-zinc-100">
          {title}
        </h3>
        {count !== undefined ? (
          <span className="shrink-0 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-1.5 py-px text-[9px] font-semibold tabular-nums text-zinc-500">
            {count}
          </span>
        ) : null}
      </div>
      {action}
      {onViewAll && !action ? (
        <button
          type="button"
          onClick={onViewAll}
          className="shrink-0 text-[10px] font-medium text-zinc-500 transition-smooth hover:text-violet-300"
        >
          {viewAllLabel} →
        </button>
      ) : null}
    </div>
  )
}
