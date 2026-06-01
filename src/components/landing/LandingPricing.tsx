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
        <div className="landing-pricing-carousel-shell relative mt-7 min-w-0 lg:hidden">
          <div
            className="landing-pricing-carousel scrollbar-hide flex overflow-x-auto overscroll-x-contain"
            role="region"
            aria-roledescription="Karussell"
            aria-label="Preispläne"
            tabIndex={0}
          >
            {LANDING_PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} mobile />
            ))}
            <span className="landing-pricing-carousel__tail shrink-0" aria-hidden />
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
        'landing-pricing-card landing-glass-card relative flex flex-col transition-all duration-300',
        mobile
          ? 'landing-pricing-card--mobile shrink-0 rounded-2xl p-5 sm:p-5'
          : 'rounded-2xl p-5',
        isFeatured &&
          'landing-pricing-card--featured z-[1] border-fuchsia-500/45 bg-gradient-to-b from-fuchsia-950/25 via-zinc-950/95 to-zinc-950 shadow-[0_0_56px_-12px_rgba(217,70,239,0.4)] lg:scale-[1.03]',
        !isFeatured && 'hover:border-violet-500/20',
        mobile && isFeatured && 'pt-6',
      )}
    >
      {isFeatured ? (
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-900/40">
          Beliebteste Wahl
        </span>
      ) : null}

      <div className={cn('flex min-h-0 flex-1 flex-col', mobile && 'min-h-[17.5rem]')}>
        <p
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-xs',
            isFeatured ? 'text-fuchsia-300' : 'text-zinc-500',
          )}
        >
          {tier.name}
        </p>
        <p className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span
            className={cn(
              'font-bold tracking-tight text-white',
              mobile ? 'text-[1.75rem] leading-none' : 'text-2xl xl:text-3xl',
            )}
          >
            {tier.price}
          </span>
          <span className="text-[11px] text-zinc-500 sm:text-xs">{tier.suffix}</span>
        </p>
        <p
          className={cn(
            'mt-2.5 text-[13px] leading-relaxed text-zinc-400 sm:text-xs sm:text-zinc-500',
            mobile ? 'min-h-[2.75rem]' : 'min-h-[2.5rem]',
          )}
        >
          {tier.description}
        </p>

        <ul
          className={cn(
            'mt-5 flex-1',
            mobile ? 'space-y-2.5' : 'mt-4 space-y-2',
          )}
        >
          {tier.features.map((feature) => (
            <li
              key={feature}
              className={cn(
                'flex items-start gap-2.5',
                mobile ? 'text-[13px] leading-snug text-zinc-300' : 'text-xs text-zinc-300',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex shrink-0 items-center justify-center rounded-full font-bold',
                  mobile ? 'size-[1.125rem] text-[10px]' : 'size-4 text-[9px]',
                  isFeatured ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-zinc-800 text-zinc-400',
                )}
                aria-hidden
              >
                ✓
              </span>
              <span className="min-w-0 flex-1">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn('mt-auto shrink-0', mobile ? 'pt-5' : 'mt-6')}>
        {tier.contactOnly ? (
          <button
            type="button"
            onClick={handleCta}
            className={cn(
              'landing-btn-secondary landing-pricing-card__cta w-full',
              mobile ? 'min-h-[2.5rem] text-[13px]' : 'text-xs',
            )}
          >
            {tier.cta}
          </button>
        ) : (
          <GoogleSignInButton
            label={tier.cta}
            variant={isFeatured ? 'gradient' : 'outline'}
            size="md"
            className="landing-pricing-card__cta !w-full"
          />
        )}
      </div>
    </article>
  )
}
