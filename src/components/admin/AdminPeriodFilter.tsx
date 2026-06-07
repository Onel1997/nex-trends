import { cn } from '@/lib'
import type { AnalyticsPeriod } from '@/types/analytics'

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: '24h', label: 'Last 24h' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
]

type AdminPeriodFilterProps = {
  value: AnalyticsPeriod
  onChange: (period: AnalyticsPeriod) => void
  className?: string
  disabled?: boolean
}

export function AdminPeriodFilter({
  value,
  onChange,
  className,
  disabled,
}: AdminPeriodFilterProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-1',
        className,
      )}
      role="group"
      aria-label="Zeitraum filtern"
    >
      {PERIODS.map((p) => {
        const active = value === p.id
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              active
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30'
                : 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
