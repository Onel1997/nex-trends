import type { ReactNode } from 'react'
import { TrustedCreatorsBadge } from '@/components/landing/TrustedCreatorsBadge'
import { cn } from '@/lib/utils'

export type NexTrendsHeroProps = {
  className?: string
  /** Show built-in navbar (production homepage). Hide when using `LandingHeader`. */
  showNav?: boolean
  /** Show trusted-by-creators badge below CTAs */
  showTrustBadge?: boolean
  primaryCta?: ReactNode
  onLiveDemo?: () => void
  demoHref?: string
  /** Slot for dashboard preview or extra hero content */
  children?: ReactNode
}

function DefaultPrimaryCta() {
  return (
    <a
      href="/login"
      className="landing-btn-primary inline-flex w-full max-w-sm items-center justify-center rounded-2xl px-6 py-3.5 text-base font-semibold sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg"
    >
      Kostenlos starten
    </a>
  )
}

function LiveDemoButton({
  onLiveDemo,
  demoHref = '#workflow',
}: Pick<NexTrendsHeroProps, 'onLiveDemo' | 'demoHref'>) {
  const className =
    'landing-btn-secondary inline-flex w-full max-w-sm items-center justify-center rounded-2xl px-6 py-3.5 text-base font-semibold sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg'

  if (onLiveDemo) {
    return (
      <button type="button" onClick={onLiveDemo} className={className}>
        Live Demo
      </button>
    )
  }

  return (
    <a href={demoHref} className={className}>
      Live Demo
    </a>
  )
}

export function NexTrendsHero({
  className,
  showNav = true,
  showTrustBadge = true,
  primaryCta,
  onLiveDemo,
  demoHref,
  children,
}: NexTrendsHeroProps) {
  return (
    <section
      className={cn(
        'landing-hero-unified relative overflow-x-hidden bg-black text-white',
        className,
      )}
    >
      {/* Ambient background */}
      <div className="landing-hero__bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgb(255 255 255 / 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgb(255 255 255 / 0.02) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
        aria-hidden
      />

      {/* Animated glow orbs */}
      <div
        className="hero-glow-orb pointer-events-none absolute top-[-8%] left-1/2 h-[min(320px,85vw)] w-[min(480px,95vw)] -translate-x-1/2 rounded-full bg-purple-600/25 blur-[100px] sm:h-[520px] sm:w-[720px] sm:blur-[140px]"
        aria-hidden
      />
      <div
        className="hero-glow-orb hero-glow-orb--secondary pointer-events-none absolute top-[12%] right-[-12%] h-[min(200px,45vw)] w-[min(200px,45vw)] rounded-full bg-violet-500/15 blur-[80px] sm:h-[280px] sm:w-[280px] sm:blur-[100px]"
        aria-hidden
      />
      <div
        className="hero-glow-orb hero-glow-orb--tertiary pointer-events-none absolute bottom-[20%] left-[-10%] h-[min(180px,40vw)] w-[min(180px,40vw)] rounded-full bg-fuchsia-600/10 blur-[70px] sm:h-[240px] sm:w-[240px]"
        aria-hidden
      />

      {showNav ? (
        <nav className="hero-fade-in relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 md:px-12 md:py-6">
          <p className="shrink-0 text-lg font-bold tracking-[-0.03em] sm:text-2xl">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Nex
            </span>
            <span className="text-white">Trends</span>
          </p>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium whitespace-nowrap backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] sm:px-5 sm:py-2 sm:text-sm"
            >
              Login
            </a>

            <a
              href="/login"
              className="landing-btn-primary inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap sm:px-5 sm:py-2 sm:text-sm"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Kostenlos starten</span>
            </a>
          </div>
        </nav>
      ) : null}

      {/* Hero content */}
      <div
        className={cn(
          'relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center',
          'px-4 text-center sm:px-6 lg:px-8',
          showNav
            ? 'pt-12 pb-14 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20'
            : 'pt-16 pb-14 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20',
        )}
      >
        {/* Badge */}
        <div
          className={cn(
            'hero-fade-in hero-fade-in--1 mb-6 max-w-[calc(100vw-2rem)] rounded-full',
            'border border-purple-500/25 bg-purple-500/[0.08] px-4 py-2',
            'text-[11px] font-medium tracking-wide text-purple-200/90 backdrop-blur-md',
            'shadow-[0_0_24px_-8px_rgb(139_92_246_/_0.35)] sm:mb-8 sm:px-5 sm:text-sm',
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="landing-live-dot size-1.5 rounded-full bg-violet-400" aria-hidden />
            AI-Powered Marketing Suite
          </span>
        </div>

        {/* Headline */}
        <h1
          id="nextrends-hero-heading"
          className={cn(
            'landing-display hero-fade-in hero-fade-in--2 w-full max-w-[20rem] text-balance',
            'text-[1.75rem] leading-[1.06] font-semibold tracking-[-0.045em]',
            'min-[390px]:max-w-xs min-[390px]:text-[2rem]',
            'sm:max-w-3xl sm:text-5xl sm:leading-[1.04]',
            'md:max-w-4xl md:text-6xl',
            'lg:max-w-5xl lg:text-[4.5rem] lg:leading-[1.02]',
          )}
        >
          AI Marketing Suite für{' '}
          <span className="landing-gradient-text">TikTok &amp; Instagram</span>
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            'hero-fade-in hero-fade-in--3 mt-5 w-full max-w-lg text-pretty text-zinc-400',
            'text-[0.9375rem] leading-[1.65] font-normal tracking-[-0.01em]',
            'sm:mt-7 sm:max-w-2xl sm:text-lg sm:leading-relaxed',
            'md:text-xl md:leading-relaxed',
          )}
        >
          Entdecke virale Trends, generiere Hooks &amp; Ad Copy mit KI und automatisiere
          deinen Content Workflow.
        </p>

        {/* CTAs */}
        <div
          className={cn(
            'hero-fade-in hero-fade-in--4 mt-9 flex w-full max-w-sm flex-col items-stretch gap-3',
            'sm:mt-11 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4',
          )}
        >
          <div className="w-full sm:w-auto">{primaryCta ?? <DefaultPrimaryCta />}</div>
          <div className="w-full sm:w-auto">
            <LiveDemoButton onLiveDemo={onLiveDemo} demoHref={demoHref} />
          </div>
        </div>

        {showTrustBadge ? (
          <TrustedCreatorsBadge className="mt-10 sm:mt-12" />
        ) : null}

        {children ? (
          <div className="mt-12 w-full sm:mt-16 md:mt-20">{children}</div>
        ) : null}
      </div>
    </section>
  )
}
