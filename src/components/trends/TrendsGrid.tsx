import { lazy, Suspense, useState } from 'react'
import { TrendCard, type DisplayTrend } from '@/components/trends/TrendCard'
import { TrendAnalysisLoading } from '@/components/trends/TrendAnalysisLoading'
import { TrendProUpsell } from '@/components/trends/TrendProUpsell'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { TrendsGridSkeleton } from '@/components/ui/Skeleton'
import { SparklesIcon } from '@/components/ui/icons'
import { DEMO_TREND_INTELLIGENCE } from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const TrendDetailModal = lazy(() =>
  import('@/components/trends/TrendDetailModal').then((m) => ({
    default: m.TrendDetailModal,
  })),
)

type TrendsGridProps = {
  trends: DisplayTrend[]
  isSearching: boolean
  isDemo?: boolean
  creditsRemaining?: number | null
  creditsLimit?: number
  onTryDemo?: () => void
  isSaved?: (id: string) => boolean
  onToggleSave?: (trend: TrendIntelligence) => boolean
}

export function TrendsGrid({
  trends,
  isSearching,
  isDemo = false,
  creditsRemaining,
  creditsLimit = 15,
  onTryDemo,
  isSaved,
  onToggleSave,
}: TrendsGridProps) {
  const [selectedTrend, setSelectedTrend] = useState<DisplayTrend | null>(null)

  if (isSearching) {
    return (
      <div className="mt-6 space-y-4">
        <TrendAnalysisLoading />
        <TrendsGridSkeleton />
      </div>
    )
  }

  if (trends.length === 0) {
    const creditsHint =
      creditsRemaining != null
        ? `Du hast ${creditsRemaining} von ${creditsLimit} Credits — starte deine Nischen-Analyse.`
        : 'Analysiere virale Signale für TikTok & Instagram in deiner Nische.'

    return (
      <div className="mt-6 space-y-6">
        <TrendsEmptyState
          className="animate-fade-in"
          variant="search"
          title="Trend Intelligence starten"
          description={creditsHint}
          action={
            onTryDemo ? (
              <button
                type="button"
                onClick={onTryDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/8 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-smooth hover:bg-violet-500/12 active:scale-[0.98]"
              >
                <SparklesIcon className="size-4" aria-hidden />
                Beispiel-Insights ansehen
              </button>
            ) : (
              <p className="inline-flex items-center gap-2 text-xs text-violet-400/80">
                <SparklesIcon className="size-4" aria-hidden />
                1 Credit pro Analyse · KI-geschätzte Metriken
              </p>
            )
          }
        />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Vorschau
          </p>
          <div className="trend-feed">
            {DEMO_TREND_INTELLIGENCE.slice(0, 2).map((trend, i) => (
              <div key={trend.id} className="trend-feed-item">
                <TrendCard
                  trend={trend}
                  onClick={() => setSelectedTrend(trend)}
                  priority={i === 0}
                  isSaved={isSaved?.(trend.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <Suspense fallback={null}>
          <TrendDetailModal
            trend={selectedTrend}
            onClose={() => setSelectedTrend(null)}
            isSaved={selectedTrend ? isSaved?.(selectedTrend.id) : false}
            onToggleSave={onToggleSave}
          />
        </Suspense>
      </div>
    )
  }

  return (
    <>
      {isDemo && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1 font-medium text-zinc-500">
            Beispiel-Insights
          </span>
          <span>Illustrative Daten — starte eine Suche für deine Nische.</span>
        </p>
      )}

      {!isDemo && (
        <p className="mt-4 text-xs text-zinc-600">
          Tippe auf eine Card für die vollständige AI-Analyse
        </p>
      )}

      <div className="trend-feed mt-4 scroll-smooth-mobile">
        {trends.map((trend, index) => (
          <div
            key={trend.id}
            className="trend-feed-item animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
          >
            <TrendCard
              trend={trend}
              onClick={() => setSelectedTrend(trend)}
              priority={index < 2}
              isSaved={isSaved?.(trend.id)}
            />
          </div>
        ))}
      </div>

      {!isDemo && trends.length > 0 && <TrendProUpsell />}

      <Suspense fallback={null}>
        <TrendDetailModal
          trend={selectedTrend}
          onClose={() => setSelectedTrend(null)}
          isSaved={selectedTrend ? isSaved?.(selectedTrend.id) : false}
          onToggleSave={onToggleSave}
        />
      </Suspense>
    </>
  )
}
