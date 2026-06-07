import { EmptyState } from '@/components/ui/EmptyState'
import { SparklesIcon } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDashboardData } from '@/hooks/useDashboardData'

export function RecentActivityList() {
  const { activities, activitiesLoading } = useDashboardData()

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
        Letzte Aktivitäten
      </p>

      {activitiesLoading ? (
        <ul className="space-y-2" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-14 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : activities.length === 0 ? (
        <EmptyState
          size="compact"
          title="Noch keine Aktivität"
          description="Starte deine erste KI-Analyse — sie erscheint hier."
          icon={<SparklesIcon className="size-5 text-zinc-500" aria-hidden />}
        />
      ) : (
        <ul className="space-y-2">
          {activities.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/50 bg-zinc-950/40 px-4 py-3 transition-smooth hover:border-zinc-700/60 hover:bg-zinc-900/40"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {item.label}
                </p>
                <p className="text-xs text-zinc-500">{item.tool}</p>
              </div>
              <time className="shrink-0 text-[11px] tabular-nums text-zinc-600">
                {formatRelativeTime(item.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes} Min.`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  return `vor ${days} Tag${days === 1 ? '' : 'en'}`
}
