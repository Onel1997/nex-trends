import { memo, type ReactNode } from 'react'
import { cn } from '@/lib'

type DashboardOnboardingEmptyProps = {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  compact?: boolean
}

function DashboardOnboardingEmptyInner({
  title,
  description,
  icon,
  action,
  className,
  compact = false,
}: DashboardOnboardingEmptyProps) {
  return (
    <div
      className={cn(
        'dashboard-os-onboarding-empty relative overflow-hidden text-center',
        compact ? 'px-3 py-6 sm:py-7' : 'px-4 py-8 sm:py-10',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgb(139_92_246/0.12),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/35 to-transparent"
        aria-hidden
      />

      <div className="relative">
        {icon ? (
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/8 shadow-[0_0_32px_-12px_rgba(139,92,246,0.45)] sm:size-12">
            {icon}
          </div>
        ) : null}

        <h3
          className={cn(
            'font-semibold tracking-tight text-zinc-100',
            compact ? 'text-sm' : 'text-base sm:text-lg',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'dashboard-os-muted mx-auto mt-1.5 max-w-sm leading-relaxed',
            compact ? 'text-[11px]' : 'text-xs sm:text-sm',
          )}
        >
          {description}
        </p>

        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}

export const DashboardOnboardingEmpty = memo(DashboardOnboardingEmptyInner)
