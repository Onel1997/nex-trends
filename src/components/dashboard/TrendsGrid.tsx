import { TrendCard, type DisplayTrend } from '@/components/dashboard/TrendCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchIcon, SparklesIcon } from '@/components/ui/icons'

type TrendsGridProps = {
  trends: DisplayTrend[]
  isSearching: boolean
  creditsRemaining?: number | null
  creditsLimit?: number
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <span className="relative block size-12" aria-hidden>
        <span className="absolute inset-0 rounded-full border-2 border-violet-900/60" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500 border-r-fuchsia-500" />
      </span>
      <span className="text-sm text-zinc-400">KI analysiert virale Trends …</span>
    </div>
  )
}

export function TrendsGrid({
  trends,
  isSearching,
  creditsRemaining,
  creditsLimit = 10,
}: TrendsGridProps) {
  if (isSearching) {
    return <LoadingSpinner />
  }

  if (trends.length === 0) {
    const creditsHint =
      creditsRemaining != null
        ? `Du hast ${creditsRemaining} von ${creditsLimit} Credits — starte jetzt deine erste Suche!`
        : 'Gib eine Nische ein und entdecke virale Trends für TikTok & Instagram.'

    return (
      <EmptyState
        className="mt-6"
        icon={<SearchIcon className="size-6 text-violet-400" aria-hidden />}
        title="Bereit zum Scouting?"
        description={creditsHint}
        action={
          <p className="inline-flex items-center gap-2 text-xs text-violet-400/90">
            <SparklesIcon className="size-4" aria-hidden />
            Trend-Scouting ist für Free User freigeschaltet
          </p>
        }
      />
    )
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
      {trends.map((trend) => (
        <TrendCard key={trend.id} trend={trend} />
      ))}
    </div>
  )
}
