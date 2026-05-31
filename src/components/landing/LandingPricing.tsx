import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { LANDING_PRICING_TIERS } from '@/lib/landing'
import { cn } from '@/lib'

const ENTERPRISE_EMAIL = 'agency@nextrends.ai'

export function LandingPricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="landing-section relative border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100%,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Preise"
          title="Skaliere mit dem richtigen Plan."
          titleAccent="Pro Creator ist das Herzstück."
          description="Vom kostenlosen Einstieg bis zur Agentur-Infrastruktur — AI Video Studio exklusiv ab Studio."
        />

        {/* Mobile carousel */}
        <div
          className="landing-pricing-carousel mt-10 flex gap-3 overflow-x-auto pb-3 pt-2 scrollbar-hide lg:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {LANDING_PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} mobile />
          ))}
        </div>

        {/* Desktop grid */}
        <div className="mt-12 hidden gap-4 lg:grid lg:grid-cols-5 lg:gap-3 xl:gap-4">
          {LANDING_PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          AI Video Studio ist ab Studio (99 €/Mo.) verfügbar — nicht in Pro Creator enthalten.
        </p>
      </div>
    </section>
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
        'landing-pricing-card relative flex flex-col rounded-2xl border p-5 transition-all duration-300',
        mobile && 'w-[min(82vw,18rem)] shrink-0 snap-center',
        isFeatured
          ? 'z-[1] border-fuchsia-500/45 bg-gradient-to-b from-fuchsia-950/25 via-zinc-950/95 to-zinc-950 shadow-[0_0_56px_-12px_rgba(217,70,239,0.4)] lg:scale-[1.03]'
          : 'border-zinc-800/70 bg-zinc-950/80 hover:border-zinc-700/80 hover:shadow-[0_0_40px_-16px_rgba(139,92,246,0.2)]',
      )}
    >
      {isFeatured && (
        <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-900/40">
          Beliebteste Wahl
        </span>
      )}

      <p className={cn('text-xs font-semibold uppercase tracking-wider', isFeatured ? 'text-fuchsia-300' : 'text-zinc-500')}>
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
