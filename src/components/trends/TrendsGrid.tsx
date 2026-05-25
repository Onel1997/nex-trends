import { lazy, memo, Suspense, useMemo, useState } from 'react'
import { TrendCard, type DisplayTrend } from '@/components/trends/TrendCard'
import { TrendAnalysisLoading } from '@/components/trends/TrendAnalysisLoading'
import { TrendProUpsell } from '@/components/trends/TrendProUpsell'
import { TrendsEmptyState } from '@/components/trends/TrendsEmptyState'
import { TrendsGridSkeleton } from '@/components/ui/Skeleton'
import { SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'
import { getDemoUserSeed, searchShuffleSeed } from '@/lib/demo-trend-seed'
import { ensureFeedMediaDiversity } from '@/lib/trend-media-assignment'
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
  hasSearched?: boolean
  searchQuery?: string
  platformFilter?: string
  creditsRemaining?: number | null
  creditsLimit?: number
  onTryDemo?: () => void
  isSaved?: (id: string) => boolean
  onToggleSave?: (trend: TrendIntelligence) => boolean
}

const TrendFeedItem = memo(function TrendFeedItem({
  trend,
  index,
  onSelect,
  isSaved,
  feedVideoUrls,
}: {
  trend: DisplayTrend
  index: number
  onSelect: (t: DisplayTrend) => void
  isSaved?: (id: string) => boolean
  feedVideoUrls: readonly string[]
}) {
  return (
    <div
      className="trend-feed-item animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 55, 280)}ms` }}
    >
      <TrendCard
        trend={trend}
        onClick={() => onSelect(trend)}
        priority={index < 2}
        isSaved={isSaved?.(trend.id)}
        feedVideoUrls={feedVideoUrls}
      />
    </div>
  )
})

export function TrendsGrid({
  trends,
  isSearching,
  isDemo = false,
  hasSearched = false,
  searchQuery = '',
  platformFilter,
  creditsRemaining,
  creditsLimit = 15,
  onTryDemo,
  isSaved,
  onToggleSave,
}: TrendsGridProps) {
  const [selectedTrend, setSelectedTrend] = useState<DisplayTrend | null>(null)

  const displayTrends = useMemo(
    () => ensureFeedMediaDiversity(trends, searchShuffleSeed('__feed__', getDemoUserSeed())),
    [trends],
  )

  const feedVideoUrls = useMemo(
    () =>
      displayTrends
        .map((t) => t.videoUrl)
        .filter((url): url is string => Boolean(url)),
    [displayTrends],
  )

  const showInitialEmpty = !hasSearched && trends.length === 0 && !isSearching
  const showNoResults = hasSearched && trends.length === 0 && !isSearching
  const showGrid = trends.length > 0

  const noResultsCopy = useMemo(() => {
    if (platformFilter && platformFilter !== 'all') {
      return {
        title: 'Keine Trends für diese Plattform',
        description: `Für „${searchQuery || 'deine Suche'}“ gibt es keine ${platformFilter}-Treffer. Wähle „Alle“ oder probiere eine andere Nische.`,
      }
    }
    return {
      title: 'Keine Trends gefunden',
      description: `Für „${searchQuery}“ konnten wir keine passenden Signale finden. Probiere eine andere Nische oder einen breiteren Suchbegriff.`,
    }
  }, [platformFilter, searchQuery])

  if (isSearching && trends.length === 0) {
    return (
      <div className="trends-grid-shell mt-6 min-h-[520px] space-y-4" aria-busy="true">
        <TrendAnalysisLoading />
        <TrendsGridSkeleton />
      </div>
    )
  }

  if (showInitialEmpty) {
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

  if (showNoResults) {
    return (
      <div className="mt-6 animate-fade-in">
        <TrendsEmptyState
          variant="search"
          title={noResultsCopy.title}
          description={noResultsCopy.description}
        />
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
      {isSearching && (
        <div className="mt-4 animate-fade-in" aria-live="polite">
          <TrendAnalysisLoading />
        </div>
      )}

      {isDemo && !isSearching && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1 font-medium text-zinc-500">
            Beispiel-Insights
          </span>
          <span>Illustrative Daten — starte eine Suche für deine Nische.</span>
        </p>
      )}

      {!isDemo && !isSearching && showGrid && (
        <p className="mt-4 text-xs text-zinc-600">
          Tippe auf eine Card für die vollständige AI-Analyse
        </p>
      )}

      {showGrid && (
        <div
          className={cn(
            'trend-feed mt-4 scroll-smooth-mobile transition-opacity duration-300',
            isSearching && 'pointer-events-none opacity-40',
          )}
          aria-busy={isSearching}
        >
          {displayTrends.map((trend, index) => (
            <TrendFeedItem
              key={trend.id}
              trend={trend}
              index={index}
              onSelect={setSelectedTrend}
              isSaved={isSaved}
              feedVideoUrls={feedVideoUrls}
            />
          ))}
        </div>
      )}

      {isSearching && trends.length === 0 && <TrendsGridSkeleton />}

      {!isDemo && showGrid && !isSearching && <TrendProUpsell />}

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
