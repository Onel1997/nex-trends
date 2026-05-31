import { memo, useMemo } from 'react'
import { SparklesIcon, TrendingUpIcon } from '@/components/ui/icons'
import { buildTrendDashboardSnapshot } from '@/lib/trend-dashboard'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import { cn } from '@/lib'

type TrendIntelligenceDashboardProps = {
  trends: TrendIntelligence[]
  className?: string
  onSelectTrend?: (trendId: string) => void
}

const HORIZONTAL_SCROLL =
  'ti-horizontal-scroll flex overflow-x-auto flex-nowrap gap-4 pb-2 snap-x snap-mandatory scrollbar-hide touch-pan-x scroll-smooth-mobile'

const HORIZONTAL_CARD = 'min-w-[260px] snap-start shrink-0'

function MetricPill({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'min-w-[7.5rem] shrink-0 snap-start rounded-2xl border px-4 py-3.5 backdrop-blur-md',
        accent
          ? 'border-violet-500/25 bg-violet-500/10 shadow-[0_0_32px_-12px_rgba(139,92,246,0.45)]'
          : 'border-zinc-800/55 bg-zinc-950/55',
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      <p
        className={cn(
          'mt-1 text-lg font-semibold tabular-nums tracking-tight',
          accent ? 'text-violet-200' : 'text-white',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function SectionCarousel({
  title,
  subtitle,
  items,
  onSelectTrend,
}: {
  title: string
  subtitle: string
  items: { id: string; label: string; meta?: string; score?: number }[]
  onSelectTrend?: (trendId: string) => void
}) {
  if (items.length === 0) return null

  return (
    <section className="ti-dashboard-section min-w-0">
      <div className="mb-3 flex items-end justify-between gap-2 px-1 sm:px-0.5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
          <p className="text-[11px] text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <div
        className={HORIZONTAL_SCROLL}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => {
          const trendId = item.id.replace(/-(hook|signal|opp)$/, '')
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTrend?.(trendId)}
              className={cn(
                'ti-dashboard-chip text-left',
                HORIZONTAL_CARD,
                'rounded-2xl border border-zinc-800/55 bg-zinc-950/65 p-4',
                'shadow-[0_8px_32px_-16px_rgba(0,0,0,0.55)] transition-smooth touch-manipulation',
                'hover:border-violet-500/25 hover:bg-violet-500/[0.06] active:scale-[0.98]',
              )}
            >
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">
                {item.label}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                {item.meta && (
                  <span className="truncate text-[10px] text-zinc-500">{item.meta}</span>
                )}
                {item.score != null && (
                  <span className="shrink-0 rounded-md bg-violet-500/12 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-violet-300">
                    {item.score}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function TrendIntelligenceDashboardInner({
  trends,
  className,
  onSelectTrend,
}: TrendIntelligenceDashboardProps) {
  const snapshot = useMemo(() => buildTrendDashboardSnapshot(trends), [trends])

  if (trends.length === 0) return null

  return (
    <div
      className={cn(
        'ti-dashboard animate-fade-in space-y-5 rounded-2xl border border-violet-500/15 bg-gradient-to-b from-violet-500/[0.07] via-zinc-950/40 to-zinc-950/20 p-4 shadow-[0_0_80px_-32px_rgba(139,92,246,0.45)] backdrop-blur-md sm:p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-1 sm:px-0">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-violet-400/90">
            <SparklesIcon className="size-3.5" aria-hidden />
            Intelligence-Übersicht
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Creator Signal Übersicht
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {trends.length} Live Signale · {snapshot.topPlatform} führend
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
          <TrendingUpIcon className="size-3" aria-hidden />
          Live
        </span>
      </div>

      <div
        className={cn('ti-dashboard-metrics', HORIZONTAL_SCROLL)}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <MetricPill label="Durchschnittliche Chance" value={snapshot.avgOpportunity} accent />
        <MetricPill label="Explodiert" value={snapshot.explodingCount} />
        <MetricPill label="Im Trend" value={snapshot.risingCount} />
        <MetricPill label="Top Plattform" value={snapshot.topPlatform} />
      </div>

      <div className="space-y-5">
        {snapshot.sections.map((section) => (
          <SectionCarousel
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            items={section.items}
            onSelectTrend={onSelectTrend}
          />
        ))}
      </div>
    </div>
  )
}

export const TrendIntelligenceDashboard = memo(TrendIntelligenceDashboardInner)
