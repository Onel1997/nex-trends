import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type NexTrendsHeroProps = {
  className?: string
  /** Show built-in navbar (production homepage). Hide when using `LandingHeader`. */
  showNav?: boolean
  primaryCta?: ReactNode
  onLiveDemo?: () => void
  demoHref?: string
}

function DefaultPrimaryCta() {
  return (
    <a
      href="/login"
      className={cn(
        'inline-flex w-full max-w-sm items-center justify-center rounded-2xl px-6 py-3.5',
        'text-base font-semibold text-white sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg',
        'bg-gradient-to-r from-purple-500 to-violet-600',
        'transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]',
      )}
    >
      Kostenlos starten
    </a>
  )
}

function LiveDemoButton({
  onLiveDemo,
  demoHref = '#workflow',
}: Pick<NexTrendsHeroProps, 'onLiveDemo' | 'demoHref'>) {
  const className = cn(
    'inline-flex w-full max-w-sm items-center justify-center rounded-2xl px-6 py-3.5',
    'text-base font-semibold sm:w-auto sm:max-w-none sm:px-8 sm:py-4 sm:text-lg',
    'border border-white/10 bg-white/5 text-white',
    'transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]',
  )

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
  primaryCta,
  onLiveDemo,
  demoHref,
}: NexTrendsHeroProps) {
  return (
    <section
      className={cn(
        'relative min-h-svh overflow-x-hidden bg-black text-white',
        className,
      )}
    >
      {/* Glow — scaled down on mobile to avoid overflow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[min(280px,80vw)] w-[min(280px,90vw)] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[80px] sm:h-[500px] sm:w-[500px] sm:blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-[min(200px,50vw)] w-[min(200px,55vw)] rounded-full bg-violet-500/10 blur-[70px] sm:h-[300px] sm:w-[300px] sm:blur-[100px]"
        aria-hidden
      />

      {showNav ? (
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 md:px-12 md:py-6">
          <p className="shrink-0 text-lg font-bold tracking-tight sm:text-2xl">NexTrends</p>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <a
              href="/login"
              className={cn(
                'inline-flex items-center justify-center rounded-xl border border-white/10',
                'px-3 py-1.5 text-xs font-medium whitespace-nowrap',
                'transition-colors hover:bg-white/5',
                'sm:px-5 sm:py-2 sm:text-sm',
              )}
            >
              Login
            </a>

            <a
              href="/login"
              className={cn(
                'inline-flex items-center justify-center rounded-xl font-medium whitespace-nowrap',
                'bg-gradient-to-r from-purple-500 to-violet-600 text-white',
                'px-3 py-1.5 text-xs transition-transform hover:scale-105',
                'sm:px-5 sm:py-2 sm:text-sm',
              )}
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
          'relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center',
          'px-4 text-center sm:px-6',
          showNav ? 'pt-10 pb-16 sm:pt-16 sm:pb-20 md:pt-20' : 'pt-20 pb-16 sm:pt-24 sm:pb-20',
        )}
      >
        {/* Badge */}
        <div
          className={cn(
            'mb-5 max-w-[calc(100vw-2rem)] rounded-full border border-purple-500/30',
            'bg-purple-500/10 px-3 py-1.5 text-[10px] font-medium text-purple-300',
            'sm:mb-6 sm:px-4 sm:py-2 sm:text-sm',
          )}
        >
          <span className="block truncate sm:whitespace-normal">
            AI-Powered Marketing Suite
          </span>
        </div>

        {/* Headline */}
        <h1
          id="nextrends-hero-heading"
          className={cn(
            'w-full max-w-[18rem] text-balance break-words',
            'text-[1.625rem] leading-[1.15] font-extrabold tracking-tight',
            'min-[390px]:max-w-xs min-[390px]:text-[1.875rem]',
            'sm:max-w-2xl sm:text-5xl sm:leading-[1.1]',
            'md:max-w-4xl md:text-6xl',
            'lg:max-w-5xl lg:text-7xl',
          )}
        >
          AI Marketing Suite für TikTok &amp; Instagram
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            'mt-4 w-full max-w-md text-pretty text-zinc-400',
            'text-[0.9375rem] leading-relaxed',
            'sm:mt-6 sm:max-w-2xl sm:text-lg sm:leading-relaxed',
          )}
        >
          Entdecke virale Trends, generiere Hooks &amp; Ad Copy mit KI und automatisiere
          deinen Content Workflow.
        </p>

        {/* CTAs — full-width stack on mobile */}
        <div
          className={cn(
            'mt-8 flex w-full max-w-sm flex-col items-stretch gap-3',
            'sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4',
          )}
        >
          <div className="w-full sm:w-auto">{primaryCta ?? <DefaultPrimaryCta />}</div>
          <div className="w-full sm:w-auto">
            <LiveDemoButton onLiveDemo={onLiveDemo} demoHref={demoHref} />
          </div>
        </div>
      </div>
    </section>
  )
}
