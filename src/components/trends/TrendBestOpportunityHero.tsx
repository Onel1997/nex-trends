'use client'

import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { SparklesIcon } from '@/components/ui/icons'
import { TrendScoreStrip } from '@/components/trends/TrendScoreStrip'
import { TrendStateBadge } from '@/components/trends/TrendStateBadge'
import { pickBestOpportunityTrend } from '@/lib/trend-dashboard'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import { cn } from '@/lib'

type TrendBestOpportunityHeroProps = {
  trends: TrendIntelligence[]
  onOpenAnalysis: (trendId: string) => void
  className?: string
}

function platformLabel(platform: string): string {
  const p = platform.trim()
  if (!p) return 'Multi'
  return p.split(' ')[0] ?? p
}

function TrendBestOpportunityHeroInner({
  trends,
  onOpenAnalysis,
  className,
}: TrendBestOpportunityHeroProps) {
  const trend = useMemo(() => pickBestOpportunityTrend(trends), [trends])

  if (!trend) return null

  return (
    <article
      className={cn(
        'ti-opportunity-hero animate-fade-in relative overflow-hidden rounded-2xl border border-violet-500/35',
        'bg-gradient-to-br from-violet-600/20 via-zinc-950/90 to-fuchsia-950/25',
        'p-4 shadow-[0_0_80px_-24px_rgba(139,92,246,0.65),0_20px_50px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md sm:p-5',
        className,
      )}
      aria-labelledby="ti-opportunity-hero-title"
    >
      <div
        className="ti-opportunity-hero__glow pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-violet-500/25 blur-3xl"
        aria-hidden
      />
      <div
        className="ti-opportunity-hero__mesh pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      />

      <div className="relative z-[1]">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="ti-opportunity-hero__eyebrow flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-violet-200/95 sm:text-[10px]">
            <SparklesIcon className="size-3 shrink-0" aria-hidden />
            Beste Chance heute
          </p>
          {trend.trendState ? (
            <TrendStateBadge state={trend.trendState} size="sm" className="shrink-0" />
          ) : null}
        </div>

        <h2
          id="ti-opportunity-hero-title"
          className="ti-opportunity-hero__title mt-2 text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl"
        >
          {trend.title}
        </h2>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="ti-opportunity-hero__platform inline-flex items-center rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
            {platformLabel(trend.platform)}
          </span>
          {trend.niche ? (
            <span className="truncate text-[10px] font-medium text-zinc-500 sm:text-xs">
              {trend.niche}
            </span>
          ) : null}
        </div>

        <TrendScoreStrip
          className="ti-opportunity-hero__scores mt-3 border-violet-500/20 bg-zinc-950/60"
          compact
          momentum={trend.momentumScore}
          competition={trend.competitionScore}
          opportunity={trend.opportunityScore}
        />

        <Button
          type="button"
          variant="pro"
          fullWidth
          size="md"
          className="ti-opportunity-hero__cta mt-4 min-h-11"
          onClick={() => onOpenAnalysis(trend.id)}
        >
          <SparklesIcon className="size-4" aria-hidden />
          KI-Analyse öffnen
        </Button>
      </div>
    </article>
  )
}

export const TrendBestOpportunityHero = memo(TrendBestOpportunityHeroInner)
