import { useState } from 'react'
import { cn } from '@/lib'
import {
  getViralScoreTone,
  VELOCITY_META,
} from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type DisplayTrend = TrendIntelligence

type TrendCardProps = {
  trend: TrendIntelligence
}

function ViralScoreRing({ score }: { score: number }) {
  const tone = getViralScoreTone(score)
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center">
      <svg className="size-11 -rotate-90" viewBox="0 0 44 44" aria-hidden>
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          strokeWidth="3"
          className="stroke-zinc-800/80"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className={cn('transition-all duration-700', tone.ringClass)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn('absolute text-xs font-bold tabular-nums', tone.textClass)}>
        {score}
      </span>
    </div>
  )
}

export function TrendCard({ trend }: TrendCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')
  const velocity = VELOCITY_META[trend.trendVelocity]
  const scoreTone = getViralScoreTone(trend.viralScore)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-sm transition-smooth hover:-translate-y-0.5 hover:border-zinc-700/70 hover:shadow-xl hover:shadow-violet-950/15">
      <div
        className={cn(
          'relative flex aspect-[16/10] w-full flex-col justify-between bg-gradient-to-br p-4 sm:aspect-video',
          trend.gradientFrom,
          trend.gradientTo,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md',
                isTikTok
                  ? 'bg-black/50 text-white ring-1 ring-white/15'
                  : 'bg-white/15 text-white ring-1 ring-white/25',
              )}
            >
              {trend.platform}
            </span>
            {trend.isDemo && (
              <span className="rounded-full bg-zinc-950/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300 ring-1 ring-white/10">
                Beispiel
              </span>
            )}
          </div>
          <ViralScoreRing score={trend.viralScore} />
        </div>

        <div className="relative mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
              Viral Score · {scoreTone.label}
            </p>
            <p className="text-sm font-semibold text-white">{trend.views} Views</p>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
              velocity.className,
            )}
          >
            {velocity.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white">
          {trend.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {trend.hashtags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-violet-300/90 ring-1 ring-zinc-800/80"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-500">
          {trend.description}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-2.5 py-2">
            <p className="font-medium uppercase tracking-wider text-zinc-600">Engagement</p>
            <p className="mt-0.5 font-semibold text-zinc-200">{trend.engagement}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/50 px-2.5 py-2">
            <p className="font-medium uppercase tracking-wider text-zinc-600">Prognose</p>
            <p className="mt-0.5 line-clamp-2 font-semibold text-emerald-400/90">
              {trend.engagementPrediction.split(' ').slice(0, 3).join(' ')}…
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 px-3 py-2.5 text-xs font-medium text-zinc-400 transition-smooth hover:border-zinc-700 hover:text-zinc-200"
          aria-expanded={expanded}
        >
          Intelligence Details
          <span className="text-violet-400" aria-hidden>
            {expanded ? '−' : '+'}
          </span>
        </button>

        <div
          className={cn(
            'grid transition-all duration-300 ease-out',
            expanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-3 border-t border-zinc-800/50 pt-3 text-xs">
              <InsightBlock label="Content Idea" value={trend.contentIdeas[0]} />
              <InsightBlock label="Hook" value={trend.hookSuggestions[0]} />
              <InsightBlock label="Creator Style" value={trend.creatorInspiration} />
              <p className="text-[10px] leading-relaxed text-zinc-600">
                {trend.engagementPrediction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function InsightBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 leading-relaxed text-zinc-300">{value}</p>
    </div>
  )
}
