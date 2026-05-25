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
  viewAllLabel = 'View all →',
  action,
  className,
}: DashboardSubsectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-2', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {Icon ? (
          <Icon className={cn('size-4 shrink-0 text-violet-400/90', iconClassName)} aria-hidden />
        ) : null}
        <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-50">{title}</h3>
        {count !== undefined ? (
          <span className="shrink-0 rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
            {count}
          </span>
        ) : null}
      </div>
      {action}
      {onViewAll && !action ? (
        <button
          type="button"
          onClick={onViewAll}
          className="shrink-0 text-xs font-medium text-violet-400 transition-smooth hover:text-violet-300"
        >
          {viewAllLabel}
        </button>
      ) : null}
    </div>
  )
}
