import { TrendCard } from '@/components/trends/TrendCard'
import { TrendDetailModal } from '@/components/trends/TrendDetailModal'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { useState } from 'react'
import type { TrendIntelligence } from '@/types/trend-intelligence'

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
      <p className="mb-4 text-xs text-zinc-500">
        {trends.length} gespeichert · lokal · Supabase-Sync vorbereitet
      </p>
      <div className="trend-feed">
        {trends.map((trend, index) => (
          <div
            key={trend.id}
            className="trend-feed-item animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
          >
            <TrendCard trend={trend} onClick={() => setSelected(trend)} priority={index < 2} />
          </div>
        ))}
      </div>
      <TrendDetailModal
        trend={selected}
        onClose={() => setSelected(null)}
        isSaved={selected ? isSaved(selected.id) : false}
        onToggleSave={onToggleSave}
      />
    </>
  )
}
