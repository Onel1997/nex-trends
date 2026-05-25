import type { ReactNode } from 'react'
import { cn } from '@/lib'

type DashboardSectionHeadingProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function DashboardSectionHeading({
  title,
  description,
  action,
  className,
}: DashboardSectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4 sm:gap-2.5',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-[13px] font-semibold tracking-tight text-zinc-100 sm:text-base">
          {title}
        </h2>
        {description ? (
          <p className="dashboard-os-muted mt-0.5 max-w-xl text-xs leading-snug sm:mt-1 sm:text-sm sm:leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
