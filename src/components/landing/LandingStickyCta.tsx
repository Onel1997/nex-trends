import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { scrollToSection } from '@/lib/scroll'

export function LandingStickyCta() {
  return (
    <>
      {/* Inline premium CTA band */}
      <section
        aria-labelledby="sticky-cta-heading"
        className="landing-sticky-band relative overflow-hidden border-t border-violet-500/20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-950/40 via-fuchsia-950/20 to-violet-950/40"
          aria-hidden
        />
        <div
          className="landing-sticky-band__shimmer pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <h2
            id="sticky-cta-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Starte dein Creator OS — kostenlos.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Keine Kreditkarte. In 30 Sekunden startklar. Upgrade jederzeit auf Pro Creator oder Studio.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <GoogleSignInButton label="Kostenlos starten" className="!w-full sm:!w-auto" />
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="landing-btn-secondary inline-flex w-full min-h-14 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-8 text-base font-semibold text-zinc-200 transition-all hover:border-violet-500/40 sm:w-auto"
            >
              Pläne vergleichen
            </button>
          </div>
        </div>
      </section>

      {/* Fixed mobile sticky bar */}
      <div
        className="landing-mobile-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-violet-500/25 bg-zinc-950/92 px-3 py-2.5 backdrop-blur-xl sm:hidden"
        role="region"
        aria-label="Schnell starten"
      >
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">Creator OS · Kostenlos</p>
            <p className="text-[10px] text-zinc-500">30 Sek. bis zum ersten Output</p>
          </div>
          <GoogleSignInButton
            label="Starten"
            size="md"
            className="!w-auto shrink-0 !min-h-10 !px-4 !py-2 !text-xs"
          />
        </div>
      </div>
    </>
  )
}
