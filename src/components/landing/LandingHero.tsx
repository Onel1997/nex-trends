import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { HeroDashboardPreview } from '@/components/landing/HeroDashboardPreview'
import { HERO_PILLS, HERO_STATS, TRUST_BADGES } from '@/lib/landing'
import { scrollToSection } from '@/lib/scroll'
import { cn } from '@/lib'

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="landing-hero relative overflow-hidden px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-28 lg:pt-16"
    >
      <div className="landing-hero__bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-orb landing-hero-orb--1 pointer-events-none absolute" aria-hidden />
      <div className="landing-hero-orb landing-hero-orb--2 pointer-events-none absolute" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          {/* LEFT — Copy & CTA */}
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <p className="landing-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90 sm:text-[11px]">
              <span className="landing-live-dot size-1.5 rounded-full bg-violet-400" aria-hidden />
              Creator Operating System
            </p>

            <h1
              id="hero-heading"
              className="landing-fade-in landing-fade-in--1 text-[1.875rem] font-bold leading-[1.06] tracking-[-0.035em] text-white sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.5rem]"
            >
              Das Creator Operating System für{' '}
              <span className="landing-gradient-text">virale Inhalte.</span>
            </h1>

            <p className="landing-fade-in landing-fade-in--2 mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:text-base lg:mx-0 lg:max-w-md lg:text-[1.05rem] lg:leading-relaxed">
              Finde Trends, generiere Hooks, optimiere Content und skaliere deine Reichweite —
              alles in einer einzigen KI-Plattform.
            </p>

            <div className="landing-fade-in landing-fade-in--3 mt-7 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start sm:gap-3">
              <GoogleSignInButton
                label="Jetzt kostenlos starten"
                className="!w-full sm:!w-auto sm:!min-w-[220px]"
              />
              <button
                type="button"
                onClick={() => scrollToSection('workflow')}
                className="landing-btn-secondary w-full sm:w-auto"
              >
                Live Demo ansehen
              </button>
            </div>

            <ul className="landing-fade-in landing-fade-in--4 mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:mt-6 lg:justify-start">
              {TRUST_BADGES.map((badge) => (
                <li key={badge} className="flex items-center gap-1.5 text-[11px] text-zinc-500 sm:text-xs">
                  <span className="text-emerald-400/90" aria-hidden>✓</span>
                  {badge}
                </li>
              ))}
            </ul>

            <div className="landing-fade-in landing-fade-in--4 mt-6 flex flex-wrap justify-center gap-1.5 lg:justify-start">
              {HERO_PILLS.map((pill) => (
                <span
                  key={pill}
                  className={cn(
                    'rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] font-medium text-zinc-400',
                    pill === 'AI Video Studio' && 'border-cyan-500/15 text-cyan-300/80',
                  )}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Dashboard mockup */}
          <div className="landing-fade-in landing-fade-in--2 relative mx-auto w-full max-w-lg lg:max-w-none">
            <HeroDashboardPreview />
          </div>
        </div>

        <dl className="landing-fade-in landing-fade-in--5 mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.05] pt-10 sm:gap-8 lg:mt-20">
          {HERO_STATS.map(({ value, label }) => (
            <div key={label} className="text-center lg:text-left">
              <dt className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">{value}</dt>
              <dd className="mt-1 text-[10px] text-zinc-500 sm:text-xs">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
