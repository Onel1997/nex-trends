import type { ReactNode } from 'react'
import { cn } from '@/lib'

type DashboardSectionHeadingProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

export function DashboardSectionHeading({
  title,
  description,
  action,
  className,
  compact = false,
}: DashboardSectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-2',
        compact ? 'mb-1.5' : 'mb-2 sm:mb-2.5',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            'font-semibold tracking-tight text-zinc-100',
            compact ? 'text-xs uppercase tracking-wider text-zinc-400' : 'text-sm sm:text-[0.9375rem]',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'dashboard-os-muted max-w-xl leading-snug',
              compact
                ? 'mt-0.5 hidden text-[11px] sm:block'
                : 'mt-0.5 text-[11px] sm:text-xs',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
