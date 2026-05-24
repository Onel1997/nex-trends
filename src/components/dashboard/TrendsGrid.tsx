import { TrendCard, type DisplayTrend } from '@/components/dashboard/TrendCard'
import { TrendAnalysisLoading } from '@/components/dashboard/TrendAnalysisLoading'
import { TrendProUpsell } from '@/components/dashboard/TrendProUpsell'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrendsGridSkeleton } from '@/components/ui/Skeleton'
import { SearchIcon, SparklesIcon } from '@/components/ui/icons'
import { DEMO_TREND_INTELLIGENCE } from '@/lib/trend-intelligence'

type TrendsGridProps = {
  trends: DisplayTrend[]
  isSearching: boolean
  isDemo?: boolean
  creditsRemaining?: number | null
  creditsLimit?: number
  onTryDemo?: () => void
}

export function TrendsGrid({
  trends,
  isSearching,
  isDemo = false,
  creditsRemaining,
  creditsLimit = 15,
  onTryDemo,
}: TrendsGridProps) {
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
        <EmptyState
          className="animate-fade-in"
          icon={<SearchIcon className="size-6 text-violet-400/80" aria-hidden />}
          title="Trend Intelligence starten"
          description={creditsHint}
          action={
            onTryDemo ? (
              <button
                type="button"
                onClick={onTryDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-smooth hover:bg-violet-500/15 active:scale-[0.98]"
              >
                <SparklesIcon className="size-4" aria-hidden />
                Beispiel-Insights ansehen
              </button>
            ) : (
              <p className="inline-flex items-center gap-2 text-xs text-violet-400/90">
                <SparklesIcon className="size-4" aria-hidden />
                1 Credit pro Analyse · geschätzte KI-Metriken
              </p>
            )
          }
        />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Vorschau · Beispiel-Trends
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DEMO_TREND_INTELLIGENCE.slice(0, 2).map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {isDemo && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-2.5 py-1 font-medium text-zinc-400">
            Beispiel-Insights
          </span>
          <span>
            Illustrative Daten zur Vorschau — starte eine Suche für deine Nische (1 Credit).
          </span>
        </p>
      )}

      {!isDemo && (
        <p className="mt-4 text-xs text-zinc-600">
          KI-geschätzte Metriken basierend auf Nischen-Signalen · keine Live-API-Daten
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {trends.map((trend, index) => (
          <div
            key={trend.id}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
          >
            <TrendCard trend={trend} />
          </div>
        ))}
      </div>

      {!isDemo && trends.length > 0 && <TrendProUpsell />}
    </>
  )
}
