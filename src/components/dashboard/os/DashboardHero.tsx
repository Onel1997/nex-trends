import { memo } from 'react'
import { AnimatedCounter } from '@/components/dashboard/os/AnimatedCounter'
import { DashboardAiEngineVisual } from '@/components/dashboard/os/DashboardAiEngineVisual'
import { AiPulseIndicator } from '@/components/ui/AiPulseIndicator'
import {
  ChartBarIcon,
  ClapperboardIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import type { DashboardStats } from '@/hooks/useDashboardStats'
import type { DashboardUser } from '@/types/dashboard'
import { cn } from '@/lib'

type DashboardHeroProps = {
  user: DashboardUser | null
  stats: DashboardStats
}

const STAT_CARDS = [
  {
    key: 'videos' as const,
    label: 'AI Videos',
    sub: 'Videos generiert',
    icon: ClapperboardIcon,
  },
  {
    key: 'trends' as const,
    label: 'Saved Trends',
    sub: 'Trends gespeichert',
    icon: TrendingUpIcon,
  },
  {
    key: 'score' as const,
    label: 'Avg Score',
    sub: 'Trend-Qualität',
    icon: SparklesIcon,
  },
  {
    key: 'growth' as const,
    label: 'Growth',
    sub: 'Wöchentlich',
    icon: ChartBarIcon,
  },
]

function DashboardHeroInner({ user, stats }: DashboardHeroProps) {
  const firstName = user?.name.split(' ')[0] ?? 'Creator'
  const displayScore = stats.avgTrendScore

  return (
    <section className="dashboard-os-hero dashboard-os-card glass-premium relative overflow-hidden rounded-[var(--dash-radius-lg)] border border-violet-500/12 p-2 sm:p-3">
      <div className="dashboard-os-hero__glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__particles pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="dashboard-os-hero__particle" data-i={i} />
        ))}
      </div>

      <div className="relative space-y-2 sm:space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400">
                NexTrends AI OS
              </p>
              <AiPulseIndicator label="Live" size="sm" />
            </div>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
              Hallo, <span className="text-violet-300">{firstName}</span>
            </h1>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-400 sm:text-xs">
              Creator command center — trends, reels, and AI tools in one workspace.
            </p>
          </div>

          <div className="dashboard-os-hero__visual shrink-0">
            <DashboardAiEngineVisual variant="hero" />
          </div>
        </div>

        <div className="dashboard-os-hero__status flex items-center justify-between gap-2 rounded-[var(--dash-radius)] border border-zinc-800/50 bg-zinc-950/60 px-2 py-1.5 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2">
            <span className="dashboard-os-live-dot relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400/35 dashboard-os-live-dot__ping" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium text-emerald-400 sm:text-[11px]">
                All systems operational
              </p>
              <p className="truncate text-[9px] text-zinc-500">
                AI engines ready · Low latency
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-zinc-600" aria-hidden>
            ›
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {STAT_CARDS.map((card, i) => {
            const Icon = card.icon
            let value = 0
            let suffix = ''
            let loading = false
            let showGrowthBadge = false

            if (card.key === 'videos') {
              value = stats.videosGenerated
              loading = stats.loadingVideos
            } else if (card.key === 'trends') {
              value = stats.savedTrends
            } else if (card.key === 'score') {
              value = displayScore
            } else {
              value = stats.weeklyGrowthPct
              suffix = '%'
              showGrowthBadge = true
            }

            return (
              <div
                key={card.key}
                className={cn(
                  'dashboard-os-stat dashboard-os-stat--premium p-2 backdrop-blur-sm',
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="flex size-7 items-center justify-center rounded-md border border-violet-500/20 bg-violet-500/10">
                    <Icon className="size-3.5 text-violet-400" aria-hidden />
                  </span>
                  {showGrowthBadge && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[9px] font-semibold tabular-nums text-emerald-400">
                      +{stats.weeklyGrowthPct}%
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  {card.label}
                </p>
                <p className="dashboard-os-stat__value mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-zinc-50">
                  {card.key === 'growth' ? (
                    <>
                      +
                      <AnimatedCounter value={value} suffix={suffix} loading={loading} />
                    </>
                  ) : card.key === 'score' && displayScore === 0 ? (
                    <span className="text-zinc-600">—</span>
                  ) : (
                    <AnimatedCounter value={value} suffix={suffix} loading={loading} />
                  )}
                </p>
                <p className="mt-0.5 text-[9px] leading-snug text-zinc-500">{card.sub}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const DashboardHero = memo(DashboardHeroInner)
