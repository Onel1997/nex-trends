import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import {
  ChartBarIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { HERO_PILLS, HERO_STATS, LOGO_CLOUD, TRUST_BADGES } from '@/lib/landing'
import { scrollToSection } from '@/lib/scroll'
import { cn } from '@/lib'

const FLOAT_DELAYS = ['0s', '0.8s', '1.6s', '2.4s', '3.2s']

function HeroDashboardPreview() {
  return (
    <div className="landing-hero-preview relative mx-auto mt-12 max-w-4xl sm:mt-16">
      <div
        className="landing-hero-preview__glow pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-600/20 via-fuchsia-600/15 to-violet-600/20 blur-2xl"
        aria-hidden
      />

      <article className="landing-hero-preview__frame relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-[0_0_80px_-20px_rgba(139,92,246,0.45),0_32px_64px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl ring-1 ring-violet-500/10">
        <header className="flex items-center gap-3 border-b border-white/[0.06] bg-zinc-900/80 px-4 py-3 sm:px-5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TrendingUpIcon className="size-4 shrink-0 text-violet-400" aria-hidden />
            <span className="truncate text-xs font-medium text-zinc-300 sm:text-sm">
              NexTrends Creator OS
            </span>
          </div>
          <span className="hidden rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 sm:inline">
            Live
          </span>
        </header>

        <div className="grid gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3 sm:col-span-2 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
              Trend Intelligence
            </p>
            <p className="mt-2 text-sm font-semibold text-white sm:text-base">
              „AI Skincare Routines" · Explodiert
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['TikTok', 'Score 94', 'Im Trend'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-700/60 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Credits
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">847</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:col-span-3 sm:p-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-fuchsia-400" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Hook Generator · Output
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              „Du machst Skincare falsch — und hier ist der Beweis in 15 Sekunden."
            </p>
          </div>

          <div className="hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 sm:block">
            <ChartBarIcon className="size-4 text-emerald-400" aria-hidden />
            <p className="mt-2 text-xs text-zinc-500">Analytics</p>
            <p className="text-lg font-semibold text-white">+42%</p>
          </div>
        </div>
      </article>

      {HERO_PILLS.map((pill, i) => (
        <span
          key={pill}
          className={cn(
            'landing-hero-pill pointer-events-none absolute hidden rounded-full border border-violet-500/25 bg-zinc-950/90 px-3 py-1.5 text-[11px] font-medium text-violet-200 shadow-lg shadow-violet-950/30 backdrop-blur-md sm:inline-flex',
            i === 0 && '-left-2 top-8',
            i === 1 && '-right-2 top-16',
            i === 2 && '-left-4 bottom-12',
            i === 3 && 'right-4 bottom-20',
            i === 4 && 'left-1/2 -bottom-3 -translate-x-1/2',
            pill === 'AI Video Studio' && 'border-fuchsia-500/30 text-fuchsia-200',
          )}
          style={{ animationDelay: FLOAT_DELAYS[i] }}
        >
          {pill}
        </span>
      ))}
    </div>
  )
}

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="landing-hero relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pt-24"
    >
      <div className="landing-hero__bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[min(100vw,56rem)] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-24 size-80 rounded-full bg-fuchsia-600/15 blur-[80px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="landing-fade-in mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300 sm:text-xs">
            <span className="size-1.5 animate-pulse-soft rounded-full bg-fuchsia-400" aria-hidden />
            Creator Operating System
          </p>

          <h1
            id="hero-heading"
            className="landing-fade-in landing-fade-in--1 text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-[4.5rem]"
          >
            Das Creator Operating System{' '}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-200 bg-clip-text text-transparent">
              für virale Inhalte.
            </span>
          </h1>

          <p className="landing-fade-in landing-fade-in--2 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg md:text-xl">
            Finde Trends, generiere Hooks, optimiere Content und skaliere deine Reichweite —
            alles in einer KI-Plattform.
          </p>

          <div className="landing-fade-in landing-fade-in--3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
            <GoogleSignInButton
              label="Kostenlos starten"
              className="!w-full sm:!w-auto sm:!min-w-[200px]"
            />
            <button
              type="button"
              onClick={() => scrollToSection('workflow')}
              className="landing-btn-secondary inline-flex w-full min-h-14 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-8 py-4 text-base font-semibold text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-white/[0.07] hover:shadow-[0_0_32px_-8px_rgba(139,92,246,0.35)] sm:w-auto active:scale-[0.98]"
            >
              Live Demo ansehen
            </button>
          </div>

          <ul className="landing-fade-in landing-fade-in--4 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-8">
            {TRUST_BADGES.map((badge) => (
              <li key={badge} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="text-emerald-400" aria-hidden>✓</span>
                {badge}
              </li>
            ))}
          </ul>

          <div className="landing-fade-in landing-fade-in--4 mt-6 flex flex-wrap justify-center gap-2 sm:hidden">
            {HERO_PILLS.map((pill) => (
              <span
                key={pill}
                className={cn(
                  'rounded-full border border-violet-500/20 bg-zinc-950/80 px-2.5 py-1 text-[10px] font-medium text-violet-300',
                  pill === 'AI Video Studio' && 'border-fuchsia-500/30 text-fuchsia-300',
                )}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <HeroDashboardPreview />

        <dl className="landing-fade-in landing-fade-in--5 mt-14 grid grid-cols-3 gap-3 border-y border-white/[0.06] py-8 sm:gap-8">
          {HERO_STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="text-xl font-bold tracking-tight text-white sm:text-3xl">{value}</dt>
              <dd className="mt-1 text-[10px] text-zinc-500 sm:text-sm">{label}</dd>
            </div>
          ))}
        </dl>

        <div className="landing-fade-in landing-fade-in--5 mt-8">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
            Vertraut von Creators, Agenturen & Brands
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {LOGO_CLOUD.map((name) => (
              <li
                key={name}
                className="rounded-full border border-zinc-800/80 bg-zinc-950/60 px-3 py-1 text-[11px] font-medium text-zinc-500"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
