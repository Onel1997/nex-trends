import { lazy, Suspense, useCallback, useState } from 'react'
import { TrendCard } from '@/components/trends/TrendCard'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { TrendDetailModalLoading } from '@/components/trends/TrendDetailModalLoading'
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
}

export function SavedTrendsPanel({
  trends,
  isSaved,
  onToggleSave,
}: SavedTrendsPanelProps) {
  const [selected, setSelected] = useState<TrendIntelligence | null>(null)

  const handleToggleSave = useCallback(
    (trend: TrendIntelligence) => {
      const nowSaved = onToggleSave(trend)
      if (!nowSaved && selected?.id === trend.id) setSelected(null)
      return nowSaved
    },
    [onToggleSave, selected?.id],
  )

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
            <TrendCard
              trend={trend}
              onClick={() => setSelected(trend)}
              priority={index < 2}
              isSaved={isSaved(trend.id)}
              onToggleSave={handleToggleSave}
            />
          </div>
        ))}
      </div>
      <Suspense fallback={<TrendDetailModalLoading />}>
        <TrendDetailModal
          trend={selected}
          onClose={() => setSelected(null)}
          isSaved={selected ? isSaved(selected.id) : false}
          onToggleSave={handleToggleSave}
        />
      </Suspense>
    </>
  )
}
