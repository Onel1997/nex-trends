import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  ClapperboardIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { HERO_FLOATING_SIGNALS } from '@/lib/landing'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib'

const ACTIVITY_FEED = [
  'Hook generiert · Skincare Niche',
  'Ad Copy · Meta Conversion',
  'Trend Score aktualisiert · 94',
  'SEO Title · +18% CTR Prognose',
  'Video Render · 78% abgeschlossen',
] as const

const CHART_BARS = [38, 52, 45, 68, 58, 74, 82] as const

const FLOAT_POSITIONS = [
  'landing-signal--tl',
  'landing-signal--tr',
  'landing-signal--ml',
  'landing-signal--br',
  'landing-signal--bc',
] as const

function useLiveMetric(base: number, active: boolean) {
  const [value, setValue] = useState(base)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      setValue((v) => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.min(99, Math.max(base - 5, v + delta))
      })
    }, 3200)
    return () => window.clearInterval(id)
  }, [active, base])

  return value
}

export function HeroDashboardPreview() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const trendScore = useLiveMetric(94, inView)
  const watchtime = useLiveMetric(42, inView)
  const [feedIndex, setFeedIndex] = useState(0)
  const [queueProgress, setQueueProgress] = useState(72)

  useEffect(() => {
    if (!inView) return
    const feedId = window.setInterval(() => {
      setFeedIndex((i) => (i + 1) % ACTIVITY_FEED.length)
    }, 4000)
    const queueId = window.setInterval(() => {
      setQueueProgress((p) => (p >= 96 ? 58 : p + Math.floor(Math.random() * 8) + 2))
    }, 4500)
    return () => {
      window.clearInterval(feedId)
      window.clearInterval(queueId)
    }
  }, [inView])

  return (
    <div ref={ref} className="landing-hero-preview relative w-full">
      <div className="landing-hero-preview__ambient pointer-events-none absolute -inset-8 rounded-[2rem] opacity-70" aria-hidden />

      <article className="landing-hero-preview__frame relative overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950/85 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl">
        <header className="flex items-center gap-3 border-b border-white/[0.05] bg-zinc-900/70 px-3.5 py-2.5 sm:px-4 sm:py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2 rounded-full bg-[#FF5F57]/90" />
            <span className="size-2 rounded-full bg-[#FEBC2E]/90" />
            <span className="size-2 rounded-full bg-[#28C840]/90" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TrendingUpIcon className="size-3.5 shrink-0 text-violet-400/90" aria-hidden />
            <span className="truncate text-[11px] font-medium text-zinc-300 sm:text-xs">
              NexTrends Creator OS
            </span>
          </div>
          <span className="landing-live-dot flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 text-[9px] font-semibold text-emerald-300/90">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Live
          </span>
        </header>

        <div className="grid gap-2 p-2.5 sm:grid-cols-[1fr_7.5rem] sm:gap-3 sm:p-3.5 lg:grid-cols-[1fr_8.5rem]">
          <div className="grid gap-2 sm:gap-2.5">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="landing-dash-panel rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-2.5 sm:p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400/90">
                  Trend Intelligence
                </p>
                <p className="mt-1.5 text-xs font-semibold leading-snug text-white sm:text-sm">
                  „AI Skincare Routines"
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {['TikTok', `Score ${trendScore}`, 'Explodiert'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-zinc-700/50 bg-zinc-900/50 px-1.5 py-0.5 text-[9px] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="landing-dash-panel rounded-xl border border-zinc-800/60 bg-zinc-900/35 p-2.5 sm:p-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Creator KPIs
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-lg font-bold tabular-nums text-white sm:text-xl">+{watchtime}%</p>
                    <p className="text-[9px] text-zinc-500">Watchtime</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-white sm:text-xl">847</p>
                    <p className="text-[9px] text-zinc-500">Credits</p>
                  </div>
                </div>
                <div className="mt-2 flex h-8 items-end gap-0.5" aria-hidden>
                  {CHART_BARS.map((h, i) => (
                    <span
                      key={i}
                      className="landing-chart-bar flex-1 rounded-sm bg-violet-500/35"
                      style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="landing-dash-panel rounded-xl border border-zinc-800/55 bg-zinc-900/30 p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-3.5 text-fuchsia-400/80" aria-hidden />
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Hook Generator · Output
                </p>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-300 sm:text-xs">
                „Du machst Skincare falsch — und hier ist der Beweis in 15 Sekunden."
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="landing-dash-panel rounded-xl border border-zinc-800/55 bg-zinc-900/30 p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  AI Ad Copy
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">
                  Meta · Conversion · 3 Varianten bereit
                </p>
              </div>
              <div className="landing-dash-panel rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] p-2.5">
                <div className="flex items-center gap-1.5">
                  <ClapperboardIcon className="size-3.5 text-cyan-400/80" aria-hidden />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-400/90">
                    AI Video Queue
                  </p>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800/80">
                  <div
                    className="landing-queue-bar h-full rounded-full bg-gradient-to-r from-violet-600/90 to-cyan-500/80 transition-[width] duration-700 ease-out"
                    style={{ width: `${queueProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-[9px] tabular-nums text-zinc-500">{queueProgress}% · Rendering</p>
              </div>
            </div>
          </div>

          <aside className="landing-dash-panel hidden rounded-xl border border-zinc-800/55 bg-zinc-900/25 p-2.5 sm:block">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Activity
            </p>
            <ul className="mt-2 space-y-2">
              {ACTIVITY_FEED.slice(0, 4).map((item, i) => (
                <li
                  key={item}
                  className={cn(
                    'flex items-start gap-1.5 text-[9px] leading-snug transition-opacity duration-500',
                    i === feedIndex % 4 ? 'text-zinc-300 opacity-100' : 'text-zinc-600 opacity-60',
                  )}
                >
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-violet-500/60" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-zinc-800/50 pt-2">
              <ChartBarIcon className="size-3.5 text-emerald-400/70" aria-hidden />
              <p className="mt-1 text-[9px] text-zinc-500">Analytics</p>
              <p className="text-sm font-semibold tabular-nums text-white">+{watchtime}%</p>
            </div>
          </aside>
        </div>
      </article>

      {HERO_FLOATING_SIGNALS.map((signal, i) => (
        <div
          key={signal.id}
          className={cn(
            'landing-signal pointer-events-none absolute hidden rounded-xl border px-2.5 py-1.5 backdrop-blur-md sm:flex',
            FLOAT_POSITIONS[i],
            signal.tone === 'violet' && 'border-violet-500/20 bg-violet-950/40 text-violet-200',
            signal.tone === 'fuchsia' && 'border-fuchsia-500/20 bg-fuchsia-950/35 text-fuchsia-200',
            signal.tone === 'emerald' && 'border-emerald-500/20 bg-emerald-950/35 text-emerald-200',
            signal.tone === 'cyan' && 'border-cyan-500/20 bg-cyan-950/35 text-cyan-200',
          )}
          style={{ animationDelay: `${i * 0.7}s` }}
        >
          <div>
            <p className="text-[9px] font-medium text-zinc-400">{signal.label}</p>
            <p className="text-[11px] font-semibold tabular-nums">{signal.metric}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
