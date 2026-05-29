import { memo, type ComponentType, type SVGProps } from 'react'
import { AnimatedCounter } from '@/components/dashboard/os/AnimatedCounter'
import { cn } from '@/lib'

type DashboardMetricCardProps = {
  label: string
  value: number | string
  sub?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  loading?: boolean
  suffix?: string
  emptyDisplay?: string
  className?: string
  delayMs?: number
}

function DashboardMetricCardInner({
  label,
  value,
  sub,
  icon: Icon,
  loading = false,
  suffix = '',
  emptyDisplay,
  className,
  delayMs = 0,
}: DashboardMetricCardProps) {
  const isEmpty =
    typeof value === 'number' ? value === 0 && emptyDisplay : !value && emptyDisplay

  return (
    <article
      className={cn(
        'dashboard-os-metric-card dashboard-os-stat dashboard-os-stat--premium nex-card-interactive',
        'animate-fade-in p-2.5 sm:p-3',
        className,
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
            <Icon className="size-3.5 text-violet-400" aria-hidden />
          </span>
        ) : null}
        <p className="min-w-0 flex-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {label}
        </p>
      </div>

      <p className="dashboard-os-stat__value mt-2 text-xl font-semibold tabular-nums tracking-tight text-zinc-50 sm:text-2xl">
        {isEmpty ? (
          <span className="text-base text-zinc-600">{emptyDisplay}</span>
        ) : typeof value === 'number' ? (
          <AnimatedCounter value={value} suffix={suffix} loading={loading} />
        ) : (
          <span className="line-clamp-1 text-base sm:text-lg">{value}</span>
        )}
      </p>

      {sub ? (
        <p className="mt-1 line-clamp-2 text-[9px] leading-snug text-zinc-500 sm:text-[10px]">
          {sub}
        </p>
      ) : null}
    </article>
  )
}

export const DashboardMetricCard = memo(DashboardMetricCardInner)
