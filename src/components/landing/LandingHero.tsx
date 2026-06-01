import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { HeroDashboardPreview } from '@/components/landing/HeroDashboardPreview'
import { NexTrendsHero } from '@/components/landing/NexTrendsHero'
import { HERO_STATS } from '@/lib/landing'
import { scrollToSection } from '@/lib/scroll'

export function LandingHero() {
  return (
    <div className="relative">
      <NexTrendsHero
        showNav={false}
        primaryCta={
          <GoogleSignInButton
            label="Kostenlos starten"
            variant="gradient"
            className="!w-full sm:!w-auto sm:!min-w-[220px]"
          />
        }
        onLiveDemo={() => scrollToSection('workflow')}
      />

      <section className="relative -mt-4 px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="landing-fade-in mx-auto w-full max-w-lg lg:max-w-3xl">
            <HeroDashboardPreview />
          </div>

          <dl className="landing-fade-in landing-fade-in--5 mt-14 grid grid-cols-3 gap-3 border-t border-white/[0.05] pt-10 sm:mt-16 sm:gap-8">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="min-w-0 text-center">
                <dt className="text-lg font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                  {value}
                </dt>
                <dd className="mt-1 text-[9px] leading-tight text-zinc-500 sm:text-xs">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
