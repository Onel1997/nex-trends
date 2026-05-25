import { BookmarkIcon } from '@/components/ui/icons'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import type { DashboardToolId } from '@/lib'
import { cn } from '@/lib'

type SavedTrendsPreviewProps = {
  onNavigate: (tool: DashboardToolId) => void
  maxItems?: number
}

export function SavedTrendsPreview({ onNavigate, maxItems = 4 }: SavedTrendsPreviewProps) {
  const { savedTrends } = useSavedTrends()
  const preview = savedTrends.slice(0, maxItems)

  return (
    <div>
      {savedTrends.length > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('saved-trends')}
            className="text-xs font-medium text-violet-400/90 transition-smooth hover:text-violet-300"
          >
            Alle anzeigen →
          </button>
        </div>
      )}

      {preview.length === 0 ? (
        <EmptyState
          size="compact"
          title="Noch nichts gespeichert"
          description="Speichere Trends in Trend Intelligence für schnellen Zugriff."
          icon={<BookmarkIcon className="size-5 text-zinc-500" aria-hidden />}
          action={
            <button
              type="button"
              onClick={() => onNavigate('trend-intelligence')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              Trends entdecken →
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {preview.map((trend) => (
            <li key={trend.id}>
              <button
                type="button"
                onClick={() => onNavigate('saved-trends')}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-800/40',
                  'bg-zinc-950/40 px-3.5 py-3 text-left transition-smooth hover:border-zinc-700/60 hover:bg-zinc-900/50',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-200">
                    {trend.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-zinc-500">
                    {trend.platform} · Score {trend.viralScore}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-violet-400/80">
                  {trend.engagementRate}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
