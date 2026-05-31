import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { useScrollPast } from '@/hooks/useScrollPast'
import { scrollToSection } from '@/lib/scroll'
import { cn } from '@/lib'

export function LandingStickyCta() {
  const showFloating = useScrollPast(520)

  return (
    <>
      {/* Inline premium CTA band */}
      <section
        aria-labelledby="sticky-cta-heading"
        className="landing-sticky-band relative overflow-hidden border-t border-white/[0.05] px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-950/25 via-transparent to-violet-950/25"
          aria-hidden
        />
        <div
          className="landing-sticky-band__shimmer pointer-events-none absolute inset-0 opacity-20"
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
            Keine Kreditkarte. In unter 60 Sekunden startklar. Upgrade jederzeit auf Pro Creator oder Studio.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <GoogleSignInButton label="Jetzt kostenlos starten" className="!w-full sm:!w-auto" />
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="landing-btn-secondary w-full sm:w-auto"
            >
              Pläne vergleichen
            </button>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar — appears on scroll */}
      <div
        className={cn(
          'landing-mobile-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-zinc-950/90 px-3 py-2.5 backdrop-blur-xl transition-transform duration-300 ease-out sm:hidden',
          showFloating ? 'translate-y-0' : 'translate-y-full',
        )}
        role="region"
        aria-label="Schnell starten"
        aria-hidden={!showFloating}
      >
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">Creator OS</p>
            <p className="text-[10px] text-zinc-500">Kostenlos starten</p>
          </div>
          <GoogleSignInButton
            label="Kostenlos starten"
            size="md"
            className="!w-auto shrink-0 !min-h-[2.375rem] !px-4 !py-2 !text-xs"
          />
        </div>
      </div>

      {/* Desktop floating CTA */}
      <div
        className={cn(
          'landing-desktop-floating-cta pointer-events-none fixed bottom-6 right-6 z-40 hidden transition-all duration-300 sm:block',
          showFloating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
        aria-hidden={!showFloating}
      >
        <div className="pointer-events-auto">
          <GoogleSignInButton
            label="Kostenlos starten"
            size="md"
            className="!shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>
    </>
  )
}
