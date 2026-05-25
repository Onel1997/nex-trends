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
    label: 'AI Videos Generated',
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
    label: 'Avg Trend Score',
    icon: SparklesIcon,
    accent: 'from-indigo-600/18 to-violet-600/12',
    iconColor: 'text-indigo-300',
  },
  {
    key: 'growth' as const,
    label: 'Weekly Growth',
    icon: ChartBarIcon,
    accent: 'from-emerald-600/15 to-violet-600/10',
    iconColor: 'text-emerald-400',
  },
]

export function DashboardHero({ user, stats }: DashboardHeroProps) {
  const firstName = user?.name.split(' ')[0] ?? 'Creator'
  const displayScore = stats.avgTrendScore

  return (
    <section className="dashboard-os-hero glass-premium relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-8">
      <div className="dashboard-os-hero__glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="dashboard-os-hero__shimmer pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="nex-orb pointer-events-none absolute -right-16 -top-12 size-56 opacity-50 sm:size-72 sm:-right-20 sm:-top-16"
        aria-hidden
      />
      <div
        className="nex-orb nex-orb--fuchsia pointer-events-none absolute -bottom-24 left-1/3 size-64 opacity-40"
        aria-hidden
      />

      <div className="relative space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                NexTrends AI OS
              </p>
              <AiPulseIndicator label="Live" size="sm" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.125rem]">
              Hallo, <span className="gradient-accent-text">{firstName}</span>
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              Your creator command center — ship viral content with AI trends, cinematic
              shorts, and precision marketing tools in one operating system.
            </p>
          </div>

          <div className="glass-premium shrink-0 rounded-2xl border border-emerald-500/20 px-4 py-3 sm:min-w-[11rem]">
            <div className="flex items-center gap-2">
              <span className="ai-pulse-ring relative flex size-2.5 rounded-full bg-emerald-400/80" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/90">
                System Status
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">All systems operational</p>
            <p className="mt-1 text-[11px] text-zinc-500">AI engines ready · low latency</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
                  'dashboard-os-stat glass-premium group rounded-2xl p-3.5 sm:p-4',
                  `bg-gradient-to-br ${card.accent}`,
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl border border-white/[0.08]',
                      'bg-zinc-950/40 backdrop-blur-sm transition-smooth',
                      'group-hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.5)]',
                    )}
                  >
                    <Icon className={cn('size-4', card.iconColor)} aria-hidden />
                  </span>
                  {showGrowthBadge && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-emerald-300">
                      +{stats.weeklyGrowthPct}%
                      {stats.weeklyGrowthIsDemo ? (
                        <span className="ml-1 font-normal text-zinc-500">est.</span>
                      ) : null}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  {card.label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
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
