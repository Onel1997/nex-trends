import type { ReactNode } from 'react'
import { cn } from '@/lib'

type DashboardSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
  showDivider?: boolean
}

export function DashboardSection({
  title,
  description,
  children,
  className,
  showDivider = true,
}: DashboardSectionProps) {
  return (
    <section className={cn('dashboard-section', className)}>
      {showDivider && (
        <div
          className="dashboard-section-divider mb-6 sm:mb-8"
          role="separator"
          aria-hidden
        />
      )}
      <div className="mb-4 sm:mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}
