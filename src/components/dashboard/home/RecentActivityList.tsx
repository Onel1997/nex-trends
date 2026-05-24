import { SparklesIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'

export function RecentActivityList() {
  const { activities } = useDashboardData()

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Letzte Aktivitäten
      </p>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-8 text-center">
          <SparklesIcon className="mx-auto size-6 text-zinc-600" aria-hidden />
          <p className="mt-2 text-sm text-zinc-500">
            Noch keine KI-Aktivitäten. Starte deine erste Analyse!
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {activities.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 py-2.5 transition-colors hover:border-zinc-700/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {item.label}
                </p>
                <p className="text-xs text-zinc-500">{item.tool}</p>
              </div>
              <time className="shrink-0 text-[11px] text-zinc-600">
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
