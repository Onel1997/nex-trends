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
    <div className={cn('mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-200 sm:text-base">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
