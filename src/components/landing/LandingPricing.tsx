import { STRIPE_CHECKOUT_URL } from '@/lib'
import { signInWithGoogle } from '@/lib/auth'
import { FREE_FEATURES, PRO_FEATURES } from '@/lib/landing'

function FeatureList({
  features,
  dotClassName,
}: {
  features: readonly string[]
  dotClassName: string
}) {
  return (
    <ul className="mt-8 flex-1 space-y-3">
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-3 text-sm text-zinc-300"
        >
          <span
            className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotClassName}`}
            aria-hidden
          />
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
      className="border-t border-zinc-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Wähle deinen Plan
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            Starte kostenlos — upgrade jederzeit auf Pro für unbegrenzte Power.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:mx-auto lg:max-w-4xl">
          {/* Kostenlose Demo */}
          <article className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 transition-all duration-300 hover:border-zinc-700">
            <p className="text-sm font-medium text-zinc-500">Kostenlose Demo</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">
              Kostenlos
            </p>
            <FeatureList features={FREE_FEATURES} dotClassName="bg-zinc-500" />
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="mt-8 w-full rounded-xl border border-zinc-700 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-zinc-800"
            >
              Kostenlos starten
            </button>
          </article>

          {/* NexTrends Pro */}
          <article className="relative flex flex-col rounded-2xl border border-fuchsia-500/50 bg-zinc-950 p-8 shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)] transition-all duration-300 hover:border-fuchsia-500/70 hover:shadow-[0_0_40px_-5px_rgba(217,70,239,0.35)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-fuchsia-500 px-4 py-1 text-xs font-bold tracking-wide text-white shadow-[0_0_16px_rgba(217,70,239,0.5)]">
              Beliebteste Wahl
            </span>

            <p className="mt-2 text-sm font-medium text-zinc-400">NexTrends Pro</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">
              9,99 €
              <span className="text-lg font-normal text-zinc-500"> / Monat</span>
            </p>
            <FeatureList
              features={PRO_FEATURES}
              dotClassName="bg-fuchsia-400"
            />
            <button
              type="button"
              onClick={() => window.open(STRIPE_CHECKOUT_URL, '_blank')}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:from-fuchsia-500 hover:to-purple-500 hover:shadow-[0_0_24px_rgba(217,70,239,0.45)]"
            >
              Pro-Abo starten ✨
            </button>
          </article>
        </div>
      </div>
    </section>
  )
}
