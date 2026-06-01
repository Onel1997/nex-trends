'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  BoltIcon,
  ChartBarIcon,
  ClapperboardIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib'

const KPI_METRICS = [
  { id: 'viral', label: 'Viral Score', value: 94, suffix: '/100', delta: '+12', tone: 'violet' as const },
  { id: 'engagement', label: 'Engagement Rate', value: 8.7, suffix: '%', delta: '+2.4%', tone: 'fuchsia' as const },
  { id: 'velocity', label: 'Trend Velocity', value: 3.2, suffix: '×', delta: 'Exploding', tone: 'emerald' as const },
  { id: 'hook', label: 'AI Hook Performance', value: 91, suffix: '%', delta: '+18%', tone: 'cyan' as const },
] as const

const ENGAGEMENT_BARS = [42, 58, 48, 72, 65, 88, 76, 92] as const
const TREND_BARS = [35, 52, 68, 84, 78, 94] as const

const TRENDING_NICHES = [
  { platform: 'TikTok', topic: 'AI Skincare Routines', score: 94, tag: 'Explodiert' },
  { platform: 'Instagram', topic: 'GRWM · Clean Girl', score: 87, tag: 'Steigend' },
] as const

const AI_HOOKS = [
  '„Du machst Skincare falsch — hier ist der Beweis in 15 Sekunden."',
  '„Dieser TikTok-Trend bringt dir 10× mehr Saves — wenn du ihn richtig machst."',
] as const

const PLATFORM_STATS = [
  { platform: 'TikTok', views: '2.4M', ctr: '4.8%', growth: '+34%' },
  { platform: 'Instagram', views: '890K', ctr: '3.2%', growth: '+21%' },
] as const

const ACTIVITY = [
  'Viral Score aktualisiert · 94',
  'Hook generiert · Skincare Niche',
  'Instagram Reel · Trend Match 87%',
  'Ad Copy · 3 Varianten bereit',
] as const

function useAnimatedMetric(
  base: number,
  active: boolean,
  opts?: { decimals?: boolean; max?: number; min?: number },
) {
  const [value, setValue] = useState(base)
  const { decimals = false, max = 99, min } = opts ?? {}

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      setValue((v) => {
        const step = decimals ? 0.1 : 1
        const delta = Math.random() > 0.45 ? step : -step
        const next = decimals ? Math.round((v + delta) * 10) / 10 : v + delta
        const floor = min ?? (decimals ? base - 0.8 : base - 4)
        return Math.min(max, Math.max(floor, next))
      })
    }, 2800)
    return () => window.clearInterval(id)
  }, [active, base, decimals, max, min])

  return value
}

function formatMetric(value: number, decimals?: boolean) {
  return decimals ? value.toFixed(1) : String(Math.round(value))
}

type DashPanelProps = {
  children: ReactNode
  className?: string
  glow?: boolean
}

function DashPanel({ children, className, glow }: DashPanelProps) {
  return (
    <div
      className={cn(
        'landing-dash-glass group/panel relative overflow-hidden rounded-xl transition-all duration-300',
        glow && 'landing-dash-glow',
        'hover:border-violet-500/25 hover:bg-zinc-900/50',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export function HeroDashboardPreview() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12 })
  const viralScore = useAnimatedMetric(94, inView)
  const engagement = useAnimatedMetric(8.7, inView, { decimals: true, max: 9.9, min: 7.5 })
  const velocity = useAnimatedMetric(3.2, inView, { decimals: true, max: 4.5, min: 2.4 })
  const hookPerf = useAnimatedMetric(91, inView)
  const [hookIndex, setHookIndex] = useState(0)
  const [feedIndex, setFeedIndex] = useState(0)
  const [queueProgress, setQueueProgress] = useState(78)

  const liveKpis = {
    viral: viralScore,
    engagement,
    velocity,
    hook: hookPerf,
  }

  useEffect(() => {
    if (!inView) return
    const hookId = window.setInterval(() => setHookIndex((i) => (i + 1) % AI_HOOKS.length), 5000)
    const feedId = window.setInterval(() => setFeedIndex((i) => (i + 1) % ACTIVITY.length), 3500)
    const queueId = window.setInterval(() => {
      setQueueProgress((p) => (p >= 95 ? 62 : p + Math.floor(Math.random() * 6) + 2))
    }, 4200)
    return () => {
      window.clearInterval(hookId)
      window.clearInterval(feedId)
      window.clearInterval(queueId)
    }
  }, [inView])

  return (
    <div ref={ref} className="landing-ai-dashboard-wrap group/preview relative w-full min-w-0">
      <article className="landing-ai-dashboard relative flex w-full min-w-0 flex-col overflow-hidden bg-zinc-950">
        <header className="landing-dashboard-chrome flex h-11 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-zinc-900/90 px-3 sm:h-12 sm:gap-3 sm:px-4">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-700 text-[9px] font-black text-white">
              NT
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold leading-tight text-white sm:text-xs">
                NexTrends · AI Marketing OS
              </p>
              <p className="truncate text-[9px] leading-tight text-zinc-500">
                TikTok &amp; Instagram Command Center
              </p>
            </div>
          </div>
          <span className="landing-live-dot flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 text-[9px] font-semibold text-emerald-300">
            <span className="landing-dash-live-pulse size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Live
          </span>
        </header>

        <div className="landing-dashboard-body space-y-2.5 p-2.5 sm:space-y-3 sm:p-3.5 md:p-4">
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {KPI_METRICS.map((kpi) => {
              const live =
                kpi.id === 'viral'
                  ? liveKpis.viral
                  : kpi.id === 'engagement'
                    ? liveKpis.engagement
                    : kpi.id === 'velocity'
                      ? liveKpis.velocity
                      : liveKpis.hook
              const isDecimal = kpi.id === 'engagement' || kpi.id === 'velocity'
              return (
                <DashPanel
                  key={kpi.id}
                  glow
                  className={cn(
                    'p-2.5 sm:p-3',
                    kpi.tone === 'violet' && 'border-violet-500/20',
                    kpi.tone === 'fuchsia' && 'border-fuchsia-500/20',
                    kpi.tone === 'emerald' && 'border-emerald-500/20',
                    kpi.tone === 'cyan' && 'border-cyan-500/20',
                  )}
                >
                  <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-500 sm:text-[9px]">
                    {kpi.label}
                  </p>
                  <p className="mt-1 flex items-baseline gap-0.5">
                    <span className="text-lg font-bold tabular-nums text-white sm:text-xl">
                      {formatMetric(live, isDecimal)}
                    </span>
                    <span className="text-[10px] text-zinc-500">{kpi.suffix}</span>
                  </p>
                  <span
                    className={cn(
                      'mt-1 inline-block text-[9px] font-semibold',
                      kpi.tone === 'violet' && 'text-violet-400',
                      kpi.tone === 'fuchsia' && 'text-fuchsia-400',
                      kpi.tone === 'emerald' && 'text-emerald-400',
                      kpi.tone === 'cyan' && 'text-cyan-400',
                    )}
                  >
                    {kpi.delta}
                  </span>
                </DashPanel>
              )
            })}
          </div>

          {/* Main grid */}
          <div className="grid gap-2.5 lg:grid-cols-12 lg:gap-3">
            {/* Trend cards */}
            <div className="grid gap-2 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {TRENDING_NICHES.map((trend) => (
                <DashPanel
                  key={trend.topic}
                  className="border-violet-500/15 bg-violet-500/[0.04] p-2.5 sm:p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingUpIcon className="size-3.5 text-violet-400" aria-hidden />
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider',
                          trend.platform === 'TikTok'
                            ? 'bg-zinc-800/80 text-zinc-300'
                            : 'bg-gradient-to-r from-fuchsia-600/20 to-orange-500/20 text-fuchsia-200',
                        )}
                      >
                        {trend.platform}
                      </span>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[8px] font-semibold text-emerald-300">
                      {trend.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-snug text-white sm:text-sm">
                    {trend.topic}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500">Opportunity Score</span>
                    <span className="text-sm font-bold tabular-nums text-violet-300">{trend.score}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-[width] duration-700"
                      style={{ width: `${trend.score}%` }}
                    />
                  </div>
                </DashPanel>
              ))}
            </div>

            {/* Analytics chart */}
            <DashPanel glow className="lg:col-span-4 p-2.5 sm:p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ChartBarIcon className="size-3.5 text-violet-400" aria-hidden />
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Engagement Analytics
                  </p>
                </div>
                <span className="text-[9px] font-medium text-emerald-400">7 Tage · +{formatMetric(engagement, true)}%</span>
              </div>
              <div className="mt-3 flex h-20 items-end gap-1 sm:h-24" aria-hidden>
                {ENGAGEMENT_BARS.map((h, i) => (
                  <span
                    key={i}
                    className="landing-chart-bar flex-1 rounded-sm bg-gradient-to-t from-violet-600/80 to-violet-400/30"
                    style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[8px] text-zinc-600">
                <span>Mo</span>
                <span>Di</span>
                <span>Mi</span>
                <span>Do</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>So</span>
                <span className="text-violet-400">Heute</span>
              </div>
            </DashPanel>

            {/* Platform widgets */}
            <div className="grid gap-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
              {PLATFORM_STATS.map((p) => (
                <DashPanel key={p.platform} className="p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      {p.platform}
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-400">{p.growth}</span>
                  </div>
                  <p className="mt-1.5 text-base font-bold tabular-nums text-white sm:text-lg">{p.views}</p>
                  <p className="text-[9px] text-zinc-500">
                    Reach · CTR <span className="text-zinc-300">{p.ctr}</span>
                  </p>
                  <div className="mt-2 flex h-6 items-end gap-0.5" aria-hidden>
                    {TREND_BARS.slice(0, 5).map((h, i) => (
                      <span
                        key={i}
                        className={cn(
                          'flex-1 rounded-sm',
                          p.platform === 'TikTok' ? 'bg-violet-500/40' : 'bg-fuchsia-500/35',
                        )}
                        style={{ height: `${h * 0.7}%` }}
                      />
                    ))}
                  </div>
                </DashPanel>
              ))}
            </div>
          </div>

          {/* AI Hook + secondary row */}
          <div className="grid gap-2.5 lg:grid-cols-12 lg:gap-3">
            <DashPanel glow className="border-fuchsia-500/15 bg-fuchsia-500/[0.03] p-2.5 sm:p-3 lg:col-span-7">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-fuchsia-400" aria-hidden />
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-fuchsia-300/90">
                  AI Hook Generator · Live Output
                </p>
                <span className="ml-auto rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-fuchsia-300">
                  {hookPerf}% Performance
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-200 transition-opacity duration-500 sm:text-sm">
                {AI_HOOKS[hookIndex]}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Scroll-Stopper', 'TikTok', '15s Format'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-zinc-700/50 bg-zinc-900/60 px-1.5 py-0.5 text-[8px] text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </DashPanel>

            <DashPanel className="p-2.5 sm:p-3 lg:col-span-2">
              <div className="flex items-center gap-1.5">
                <BoltIcon className="size-3.5 text-violet-400" aria-hidden />
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">Ad Copy</p>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-400">
                Meta · Conversion
                <br />
                <span className="text-zinc-300">3 Varianten bereit</span>
              </p>
            </DashPanel>

            <DashPanel className="border-cyan-500/15 bg-cyan-500/[0.03] p-2.5 sm:p-3 lg:col-span-3">
              <div className="flex items-center gap-1.5">
                <ClapperboardIcon className="size-3.5 text-cyan-400" aria-hidden />
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-400/90">
                  AI Video Queue
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                <div
                  className="landing-queue-bar h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-[width] duration-700"
                  style={{ width: `${queueProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-[9px] tabular-nums text-zinc-500">{queueProgress}% · Rendering</p>
            </DashPanel>
          </div>

          {/* Activity strip — mobile + desktop */}
          <DashPanel className="p-2.5 sm:p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              Live Activity Stream
            </p>
            <ul className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
              {ACTIVITY.map((item, i) => (
                <li
                  key={item}
                  className={cn(
                    'flex items-center gap-1.5 text-[9px] transition-opacity duration-500 sm:text-[10px]',
                    i === feedIndex % ACTIVITY.length
                      ? 'text-zinc-200 opacity-100'
                      : 'text-zinc-600 opacity-50',
                  )}
                >
                  <span className="size-1 shrink-0 rounded-full bg-violet-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </DashPanel>
        </div>
      </article>

    </div>
  )
}
