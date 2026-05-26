import { useEffect, useState } from 'react'
import { formatUsageActionLabel } from '@/lib/billing/format'
import { fetchUsageLogs } from '@/lib/billing'
import { supabase } from '@/lib/supabase'
import type { UsageLogRow } from '@/types/billing'
import { cn } from '@/lib'

type RecentUsageActivityProps = {
  limit?: number
  className?: string
  emptyMessage?: string
}

export function RecentUsageActivity({
  limit = 10,
  className,
  emptyMessage = 'No AI activity yet — run a tool to see usage here.',
}: RecentUsageActivityProps) {
  const [logs, setLogs] = useState<UsageLogRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id || !mounted) {
        setLoading(false)
        return
      }
      const rows = await fetchUsageLogs(user.id, limit)
      if (mounted) {
        setLogs(rows)
        setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [limit])

  return (
    <div className={cn('dashboard-os-card rounded-[var(--dash-radius-lg)] border border-zinc-800/50 bg-zinc-950/60', className)}>
      <div className="border-b border-zinc-800/50 px-4 py-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          Recent activity
        </p>
      </div>

      {loading ? (
        <ul className="divide-y divide-zinc-800/40 px-4 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="py-2.5">
              <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800" />
              <div className="mt-1.5 h-2 w-1/3 animate-pulse rounded bg-zinc-800/80" />
            </li>
          ))}
        </ul>
      ) : logs.length === 0 ? (
        <p className="px-4 py-6 text-center text-[11px] text-zinc-500">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-zinc-800/40">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-[11px]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-200">
                  {formatUsageActionLabel(log.feature ?? log.action)}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {new Date(log.created_at).toLocaleString('de-DE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {log.balance_after != null && (
                    <> · Balance {log.balance_after}</>
                  )}
                </p>
              </div>
              <span className="shrink-0 font-bold tabular-nums text-violet-300">
                −{log.credits_used}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
