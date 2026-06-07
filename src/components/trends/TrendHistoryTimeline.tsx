import { Button } from '@/components/ui/Button'
import { ClockIcon, SearchIcon, CloseIcon } from '@/components/ui/icons'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { cn } from '@/lib'
import type { TrendSearchHistoryEntry } from '@/types/trend-intelligence'

type TrendHistoryTimelineProps = {
  history: TrendSearchHistoryEntry[]
  onSelectQuery?: (query: string) => void
  onRemove?: (id: string) => void
  onClear?: () => void
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TrendHistoryTimeline({
  history,
  onSelectQuery,
  onRemove,
  onClear,
}: TrendHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <TrendsEmptyState
        variant="history"
        title="Noch kein Verlauf"
        description="Deine letzten Trend-Suchen erscheinen hier als Timeline — perfekt um erfolgreiche Nischen wiederzufinden."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Suchverlauf · {history.length}
        </p>
        {onClear && history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Verlauf löschen
          </Button>
        )}
      </div>

      <ol className="relative space-y-0 border-l border-zinc-800/80 pl-5">
        {history.map((entry, index) => (
          <li
            key={entry.id}
            className={cn(
              'relative pb-6 animate-fade-in last:pb-0',
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span
              className="absolute -left-[1.35rem] top-1 flex size-2.5 rounded-full bg-violet-500 ring-4 ring-zinc-950"
              aria-hidden
            />
            <div className="glass-card group p-4 transition-smooth hover:border-zinc-700/80">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectQuery?.(entry.query)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <SearchIcon className="size-4 shrink-0 text-violet-400/80" aria-hidden />
                    {entry.query}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="size-3.5" aria-hidden />
                      {formatTime(entry.timestamp)}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span>{entry.platform}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-violet-400/90">{entry.resultCount} Trends</span>
                  </p>
                </button>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    className="shrink-0 rounded-lg p-1.5 text-zinc-600 opacity-0 transition-smooth hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100"
                    aria-label="Eintrag entfernen"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
