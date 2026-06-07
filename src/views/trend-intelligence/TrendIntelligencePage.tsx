'use client'

import { SparklesIcon } from '@/components/ui/icons'
import { TrendFeedV2Panel } from '@/components/trends/v2'

export function TrendIntelligencePage() {
  return (
    <div className="trend-intelligence-page ti-v2-page dashboard-mobile-page-container min-w-0 max-w-full overflow-x-hidden">
      <header className="ti-v2-header mb-5 animate-fade-in sm:mb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400/90">
              <SparklesIcon className="size-3.5 shrink-0" aria-hidden />
              Trend Intelligence V2
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Entscheidungs-Feed
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Konkrete Signale für Creator, Agenturen und Unternehmer — Trend Score, Opportunity Score
              und Status auf einen Blick. Keine Datenflut, sondern klare nächste Schritte.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-[11px] font-medium text-emerald-300/90">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" aria-hidden />
            Live Feed
          </span>
        </div>
      </header>

      <TrendFeedV2Panel />
    </div>
  )
}
