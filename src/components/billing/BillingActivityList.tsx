import { formatUsageActionLabel } from '@/lib/billing/format'
import type { UsageLogRow } from '@/types/billing'
import { cn } from '@/lib'

type BillingActivityListProps = {
  logs: UsageLogRow[]
  className?: string
}

export function BillingActivityList({ logs, className }: BillingActivityListProps) {
  if (logs.length === 0) {
    return (
      <p className="dashboard-os-muted rounded-[var(--dash-radius)] border border-zinc-800/45 bg-zinc-950/40 px-3 py-6 text-center text-[11px]">
        No usage recorded yet. Run a tool to see activity here.
      </p>
    )
  }

  return (
    <ul className={cn('space-y-1.5', className)}>
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex items-center justify-between gap-3 rounded-[var(--dash-radius)] border border-zinc-800/40 bg-zinc-950/50 px-3 py-2 transition-smooth hover:border-violet-500/20"
        >
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-zinc-200">
              {formatUsageActionLabel(log.action)}
            </p>
            <time className="text-[10px] text-zinc-500">
              {new Date(log.created_at).toLocaleString('de-DE', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
          <span className="shrink-0 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-px text-[10px] font-bold tabular-nums text-violet-200">
            −{log.credits_used}
          </span>
        </li>
      ))}
    </ul>
  )
}
