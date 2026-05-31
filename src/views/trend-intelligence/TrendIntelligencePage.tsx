import { SparklesIcon } from '@/components/ui/icons'
import { TrendIntelligencePanel } from '@/components/trends'

export function TrendIntelligencePage() {
  return (
    <div className="trend-intelligence-page min-h-full">
      <header className="ti-header mb-5 animate-fade-in sm:mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400/90">
              <SparklesIcon className="size-3.5" aria-hidden />
              KI Trend Intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Creator Signal Engine
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Entdecke explodierende Trends, virale Hooks, Opportunity Scores und KI-Insights — gebaut für
              tägliche Creator-Recherche auf TikTok, Instagram und YouTube.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 px-3 py-1 text-[11px] font-medium text-violet-300/90">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-violet-400" aria-hidden />
            Live Intelligence
          </span>
        </div>
      </header>

      <TrendIntelligencePanel />
    </div>
  )
}
