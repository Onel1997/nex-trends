import { lazy, Suspense, useState } from 'react'
import { TrendCard } from '@/components/trends/TrendCard'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { BookmarkIcon } from '@/components/ui/icons'
import { cn } from '@/lib'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const TrendDetailModal = lazy(() =>
  import('@/components/trends/TrendDetailModal').then((m) => ({
    default: m.TrendDetailModal,
  })),
)

type SavedTrendsPanelProps = {
  trends: TrendIntelligence[]
  isSaved: (id: string) => boolean
  onToggleSave: (trend: TrendIntelligence) => boolean
  onRemove: (trendId: string) => void
}

export function SavedTrendsPanel({
  trends,
  isSaved,
  onToggleSave,
  onRemove,
}: SavedTrendsPanelProps) {
  const [selected, setSelected] = useState<TrendIntelligence | null>(null)

  if (trends.length === 0) {
    return (
      <TrendsEmptyState
        variant="saved"
        title="Noch keine gespeicherten Trends"
        description="Speichere virale Insights aus der Detailansicht — deine persönliche Trend-Bibliothek wächst mit jeder Analyse."
      />
    )
  }

  return (
    <>
      <p className="mb-4 text-xs text-zinc-500" aria-live="polite">
        <span className="font-medium text-violet-300/90">{trends.length}</span> gespeichert ·
        lokal persistent
      </p>
      <div className="trend-feed scroll-smooth-mobile">
        {trends.map((trend, index) => (
          <div
            key={trend.id}
            className="trend-feed-item animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 55, 240)}ms` }}
          >
            <div className="relative">
              <TrendCard
                trend={trend}
                onClick={() => setSelected(trend)}
                priority={index < 2}
                isSaved
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(trend.id)
                  if (selected?.id === trend.id) setSelected(null)
                }}
                className={cn(
                  'absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-lg',
                  'border border-zinc-700/60 bg-zinc-950/85 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-300',
                  'backdrop-blur-md transition-smooth',
                  'hover:border-red-500/30 hover:bg-red-950/40 hover:text-red-200',
                  'active:scale-[0.97]',
                )}
                aria-label={`${trend.title} aus Gespeichert entfernen`}
              >
                <BookmarkIcon className="size-3 fill-current text-violet-300" aria-hidden />
                Entfernen
              </button>
            </div>
          </div>
        ))}
      </div>
      <Suspense fallback={null}>
        <TrendDetailModal
          trend={selected}
          onClose={() => setSelected(null)}
          isSaved={selected ? isSaved(selected.id) : false}
          onToggleSave={onToggleSave}
        />
      </Suspense>
    </>
  )
}
