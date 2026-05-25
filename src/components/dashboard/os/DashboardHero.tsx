import { AnimatedCounter } from '@/components/dashboard/os/AnimatedCounter'
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
    icon: ClapperboardIcon,
    iconColor: 'text-violet-400',
  },
  {
    key: 'trends' as const,
    label: 'Saved Trends',
    icon: TrendingUpIcon,
    iconColor: 'text-fuchsia-400',
  },
  {
    key: 'score' as const,
    label: 'Avg Score',
    icon: SparklesIcon,
    iconColor: 'text-indigo-300',
  },
  {
    key: 'growth' as const,
    label: 'Growth',
    icon: ChartBarIcon,
    iconColor: 'text-emerald-400',
  },
]

export function DashboardHero({ user, stats }: DashboardHeroProps) {
  const firstName = user?.name.split(' ')[0] ?? 'Creator'
  const displayScore = stats.avgTrendScore

  return (
    <section className="dashboard-os-hero dashboard-os-card glass-premium relative overflow-hidden rounded-2xl border border-zinc-800/55 p-3 sm:p-4">
      <div className="dashboard-os-hero__glow pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="relative space-y-2.5 sm:space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                NexTrends AI OS
              </p>
              <AiPulseIndicator label="Live" size="sm" />
            </div>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-2xl">
              Hallo, <span className="text-violet-300">{firstName}</span>
            </h1>
            <p className="dashboard-os-muted mt-0.5 line-clamp-2 text-[11px] leading-snug sm:line-clamp-none sm:text-xs">
              Creator command center — trends, reels, and AI tools in one workspace.
            </p>
          </div>

          <div className="hidden shrink-0 rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-2.5 py-2 sm:block">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium text-zinc-400">Operational</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
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
                  'dashboard-os-stat rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-2 sm:p-2.5',
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-1">
                  <Icon className={cn('size-3.5', card.iconColor)} aria-hidden />
                  {showGrowthBadge && (
                    <span className="text-[9px] font-semibold tabular-nums text-emerald-400">
                      +{stats.weeklyGrowthPct}%
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide text-zinc-500">
                  {card.label}
                </p>
                <p className="dashboard-os-stat__value mt-0.5 text-base font-semibold tabular-nums tracking-tight text-white sm:text-lg">
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
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
