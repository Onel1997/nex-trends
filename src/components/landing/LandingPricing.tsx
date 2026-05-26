import { PRO_PRICE_LABEL } from '@/lib'
import { signInWithGoogle } from '@/lib/auth'
import { FREE_FEATURES, PRO_FEATURES } from '@/lib/landing'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { cn } from '@/lib'

function FeatureList({
  features,
  variant,
}: {
  features: readonly string[]
  variant: 'free' | 'pro'
}) {
  return (
    <ul className="mt-8 flex-1 space-y-3.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
              variant === 'pro'
                ? 'bg-fuchsia-500/20 text-fuchsia-300'
                : 'bg-zinc-800 text-zinc-400',
            )}
            aria-hidden
          >
            ✓
          </span>
          {feature}
        </li>
      ))}
    </ul>
  )
}

export function LandingPricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="border-t border-zinc-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Pricing"
          title="Starte kostenlos."
          titleAccent="Skaliere mit Pro."
          description="Keine versteckten Kosten. Upgrade nur, wenn du mehr Power brauchst — jederzeit kündbar."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:mx-auto lg:max-w-4xl">
          <article className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 transition-all duration-300 hover:border-zinc-700">
            <p className="text-sm font-medium text-zinc-500">Free</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-white">0 €</span>
              <span className="text-sm text-zinc-500">/ Monat</span>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Perfekt zum Testen — ideal für Einsteiger & Side Projects.
            </p>
            <FeatureList features={FREE_FEATURES} variant="free" />
            <GoogleSignInButton
              label="Kostenlos starten"
              variant="outline"
              size="md"
              className="mt-8 !w-full"
            />
          </article>

          <article className="relative flex flex-col rounded-2xl border border-fuchsia-500/50 bg-gradient-to-b from-zinc-950 to-violet-950/20 p-8 shadow-[0_0_40px_-8px_rgba(168,85,247,0.35)] transition-all duration-300 hover:border-fuchsia-500/70 hover:shadow-[0_0_50px_-8px_rgba(217,70,239,0.45)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1 text-xs font-bold tracking-wide text-white shadow-lg shadow-fuchsia-900/40">
              Beliebteste Wahl
            </span>

            <p className="mt-2 text-sm font-medium text-fuchsia-300">NexTrends Pro</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-white">9,99 €</span>
              <span className="text-sm text-zinc-500">/ Monat</span>
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Für Creator & Teams, die täglich mit KI skalieren wollen.
            </p>
            <FeatureList features={PRO_FEATURES} variant="pro" />
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/30 transition-all duration-300 hover:from-fuchsia-500 hover:to-violet-500 hover:shadow-fuchsia-800/40"
            >
              Anmelden & Pro starten — {PRO_PRICE_LABEL}
            </button>
            <p className="mt-3 text-center text-xs text-zinc-600">
              14 Tage Geld-zurück-Garantie · Jederzeit kündbar
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
