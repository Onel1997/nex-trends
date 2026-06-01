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
    <section className="dashboard-os-hero dashboard-os-card glass-premium relative overflow-hidden rounded-[var(--dash-radius-lg)] border border-violet-500/15 p-3 sm:p-4">
      <div className="dashboard-os-hero__shimmer pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__particles pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="dashboard-os-hero__particle" data-i={i} />
        ))}
      </div>

      <div className="relative space-y-3 sm:space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-violet-400/95">
                NexTrends AI OS
              </p>
              <AiPulseIndicator label="Live" size="sm" />
            </div>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Hallo, <span className="bg-gradient-to-r from-violet-200 to-fuchsia-300/90 bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400/95 sm:text-xs">
              Dein Creator Command Center — Trends, Reels und AI-Tools in einem Workspace.
            </p>
          </div>

          <div className="dashboard-os-hero__visual shrink-0">
            <DashboardAiEngineVisual variant="hero" />
          </div>
        </div>

        <div className="dashboard-os-hero__status flex items-center justify-between gap-2 rounded-[var(--dash-radius)] border border-emerald-500/15 bg-zinc-950/70 px-2.5 py-2 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="dashboard-os-live-dot relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400/40 dashboard-os-live-dot__ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold text-emerald-300/95 sm:text-[11px]">
                Alle Systeme aktiv
              </p>
              <p className="truncate text-[9px] text-zinc-500">
                AI Engines bereit · Niedrige Latenz
              </p>
            </div>
          </div>
          <span className="dashboard-os-hero__status-pill shrink-0 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-300/90">
            Online
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
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
                  {showGrowthBadge && stats.weeklyGrowthPct > 0 && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[9px] font-semibold tabular-nums text-emerald-400">
                      +{stats.weeklyGrowthPct}%
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  {card.label}
                </p>
                <p className="dashboard-os-stat__value mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-zinc-50">
                  {card.key === 'growth' && value === 0 ? (
                    <span className="text-zinc-600">—</span>
                  ) : card.key === 'growth' ? (
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
