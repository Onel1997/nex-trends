'use client'

import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingSection } from '@/components/landing/LandingSection'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { LANDING_PRICING_TIERS } from '@/lib/landing'
import { cn } from '@/lib'

const ENTERPRISE_EMAIL = 'agency@nextrends.ai'

export function LandingPricing() {
  return (
    <LandingSection id="pricing" glow="bottom" ariaLabelledBy="pricing-heading">
      <LandingReveal>
        <LandingSectionHeader
          eyebrow="Preise"
          title="Skaliere mit dem richtigen Plan."
          titleAccent="Pro Creator ist das Herzstück."
          description="Vom kostenlosen Einstieg bis zur Agentur-Infrastruktur — AI Video Studio exklusiv ab Studio."
        />
      </LandingReveal>

      <LandingReveal delay={80}>
        <div className="relative mt-8 min-w-0 lg:hidden">
          <div className="landing-pricing-carousel -mx-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-2 scrollbar-hide sm:-mx-6 sm:gap-4 sm:px-6">
            {LANDING_PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} mobile />
            ))}
            <span className="w-px shrink-0 snap-none sm:w-2" aria-hidden />
          </div>
        </div>
      </LandingReveal>

      <LandingReveal delay={120}>
        <div className="mt-12 hidden gap-4 lg:grid lg:grid-cols-5 lg:gap-3 xl:gap-4">
          {LANDING_PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>
      </LandingReveal>

      <p className="relative mt-6 text-center text-[11px] leading-relaxed text-zinc-600 sm:mt-8 sm:text-xs">
        AI Video Studio ist ab Studio (99 €/Mo.) verfügbar — nicht in Pro Creator enthalten.
      </p>
    </LandingSection>
  )
}

function PricingCard({
  tier,
  mobile = false,
}: {
  tier: (typeof LANDING_PRICING_TIERS)[number]
  mobile?: boolean
}) {
  const isFeatured = tier.featured

  function handleCta() {
    if (tier.contactOnly) {
      window.location.href = `mailto:${ENTERPRISE_EMAIL}?subject=NexTrends%20Agency%20Plan`
    }
  }

  return (
    <article
      className={cn(
        'landing-pricing-card landing-glass-card relative flex flex-col rounded-2xl p-5 transition-all duration-300',
        mobile &&
          'w-[min(calc(100vw-2.5rem),18.5rem)] max-w-full shrink-0 snap-start scroll-ml-4 first:scroll-ml-0',
        isFeatured
          ? 'z-[1] border-fuchsia-500/45 bg-gradient-to-b from-fuchsia-950/25 via-zinc-950/95 to-zinc-950 shadow-[0_0_56px_-12px_rgba(217,70,239,0.4)] lg:scale-[1.03]'
          : 'hover:border-violet-500/20',
      )}
    >
      {isFeatured ? (
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-900/40">
          Beliebteste Wahl
        </span>
      ) : null}

      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-wider',
          isFeatured ? 'text-fuchsia-300' : 'text-zinc-500',
        )}
      >
        {tier.name}
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1">
        <span className="text-2xl font-bold tracking-tight text-white xl:text-3xl">{tier.price}</span>
        <span className="text-xs text-zinc-500">{tier.suffix}</span>
      </p>
      <p className="mt-2 min-h-[2.5rem] text-xs leading-relaxed text-zinc-500">{tier.description}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-zinc-300">
            <span
              className={cn(
                'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                isFeatured ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-zinc-800 text-zinc-400',
              )}
              aria-hidden
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {tier.contactOnly ? (
        <button
          type="button"
          onClick={handleCta}
          className="landing-btn-secondary mt-6 w-full text-xs"
        >
          {tier.cta}
        </button>
      ) : (
        <GoogleSignInButton
          label={tier.cta}
          variant={isFeatured ? 'gradient' : 'outline'}
          size="md"
          className="mt-6 !w-full"
        />
      )}
    </article>
  )
}
