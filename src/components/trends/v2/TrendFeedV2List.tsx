import { memo } from 'react'
import { TrendCardV2 } from '@/components/trends/v2/TrendCardV2'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { TrendWithV2 } from '@/lib/trend-v2'

type TrendFeedV2ListProps = {
  trends: TrendWithV2[]
  isLoading?: boolean
  isSaved?: (id: string) => boolean
  onToggleSave?: (trend: TrendWithV2) => boolean
  onSelectTrend?: (trend: TrendWithV2) => void
  emptyTitle?: string
  emptyDescription?: string
}

function TrendFeedV2Skeleton() {
  return (
    <div className="ti-v2-feed space-y-3" aria-busy="true" aria-label="Trends werden geladen">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mb-2 h-5 w-4/5 max-w-sm" />
          <Skeleton className="mb-4 h-4 w-full max-w-md" />
          <div className="flex gap-4">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendFeedV2ListInner({
  trends,
  isLoading = false,
  isSaved,
  onToggleSave,
  onSelectTrend,
  emptyTitle = 'Keine Trends in dieser Kategorie',
  emptyDescription = 'Wähle eine andere Kategorie oder zeige alle Trends an.',
}: TrendFeedV2ListProps) {
  if (isLoading) return <TrendFeedV2Skeleton />

  if (trends.length === 0) {
    return (
      <TrendsEmptyState
        variant="search"
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="ti-v2-feed space-y-3 sm:space-y-3.5" role="list">
      {trends.map((trend, index) => (
        <div
          key={trend.id}
          role="listitem"
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 40, 280)}ms` }}
        >
          <TrendCardV2
            trend={trend}
            rank={index + 1}
            isSaved={isSaved?.(trend.id)}
            onToggleSave={onToggleSave}
            onClick={onSelectTrend ? () => onSelectTrend(trend) : undefined}
          />
        </div>
      ))}
    </div>
  )
}

export const TrendFeedV2List = memo(TrendFeedV2ListInner)
