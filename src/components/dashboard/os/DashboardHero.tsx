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
    accent: 'from-violet-600/25 to-fuchsia-600/12',
    iconColor: 'text-violet-400',
  },
  {
    key: 'trends' as const,
    label: 'Saved Trends',
    icon: TrendingUpIcon,
    accent: 'from-fuchsia-600/18 to-violet-600/12',
    iconColor: 'text-fuchsia-400',
  },
  {
    key: 'score' as const,
    label: 'Avg Score',
    icon: SparklesIcon,
    accent: 'from-indigo-600/18 to-violet-600/12',
    iconColor: 'text-indigo-300',
  },
  {
    key: 'growth' as const,
    label: 'Growth',
    icon: ChartBarIcon,
    accent: 'from-emerald-600/15 to-violet-600/10',
    iconColor: 'text-emerald-400',
  },
]

export function DashboardHero({ user, stats }: DashboardHeroProps) {
  const firstName = user?.name.split(' ')[0] ?? 'Creator'
  const displayScore = stats.avgTrendScore

  return (
    <section className="dashboard-os-hero dashboard-os-card glass-premium relative overflow-hidden rounded-2xl p-3.5 sm:rounded-3xl sm:p-7 lg:p-8">
      <div className="dashboard-os-hero__glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__shimmer pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="nex-orb pointer-events-none absolute -right-16 -top-12 hidden size-56 opacity-50 sm:block sm:size-72 sm:-right-20 sm:-top-16"
        aria-hidden
      />
      <div
        className="nex-orb nex-orb--fuchsia pointer-events-none absolute -bottom-24 left-1/3 hidden size-64 opacity-40 sm:block"
        aria-hidden
      />

      <div className="relative space-y-3 sm:space-y-6">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 max-w-2xl space-y-1.5 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400/90 sm:text-[10px] sm:tracking-[0.2em]">
                NexTrends AI OS
              </p>
              <AiPulseIndicator label="Live" size="sm" />
            </div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.125rem]">
              Hallo, <span className="gradient-accent-text">{firstName}</span>
            </h1>
            <p className="dashboard-os-muted line-clamp-2 text-[13px] leading-snug sm:line-clamp-none sm:text-sm sm:leading-relaxed lg:text-base">
              Your creator command center — AI trends, cinematic shorts, and marketing tools in one OS.
            </p>
          </div>

          {/* Mobile: inline status strip */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-zinc-950/40 px-2.5 py-2 sm:hidden">
            <span className="ai-pulse-ring relative size-2 shrink-0 rounded-full bg-emerald-400/80" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white">All systems operational</p>
              <p className="dashboard-os-muted text-[10px]">AI engines ready</p>
            </div>
          </div>

          {/* Desktop: status card */}
          <div className="glass-premium hidden shrink-0 rounded-2xl border border-emerald-500/20 px-4 py-3 sm:block sm:min-w-[11rem]">
            <div className="flex items-center gap-2">
              <span className="ai-pulse-ring relative flex size-2.5 rounded-full bg-emerald-400/80" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/90">
                System Status
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">All systems operational</p>
            <p className="dashboard-os-muted mt-1 text-[11px]">AI engines ready · low latency</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
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
                  'dashboard-os-stat glass-premium group rounded-xl p-2.5 sm:rounded-2xl sm:p-4',
                  `bg-gradient-to-br ${card.accent}`,
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-1 sm:mb-3 sm:gap-2">
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg border border-white/[0.08] sm:size-10 sm:rounded-xl',
                      'bg-zinc-950/40 backdrop-blur-sm transition-smooth',
                      'group-hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.5)]',
                    )}
                  >
                    <Icon className={cn('size-3.5 sm:size-4', card.iconColor)} aria-hidden />
                  </span>
                  {showGrowthBadge && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-emerald-300 sm:px-2 sm:text-[10px]">
                      +{stats.weeklyGrowthPct}%
                    </span>
                  )}
                </div>
                <p className="dashboard-os-muted text-[9px] font-medium uppercase tracking-wide sm:text-[10px] sm:tracking-wider">
                  {card.label}
                </p>
                <p className="dashboard-os-stat__value mt-0.5 text-lg font-semibold tracking-tight text-white sm:mt-1.5 sm:text-[1.65rem]">
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
