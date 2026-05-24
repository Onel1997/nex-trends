import { APP_NAME } from '@/lib'
import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { scrollToSection } from '@/lib/scroll'

export function LandingLogin() {
  return (
    <section
      id="login"
      aria-labelledby="cta-heading"
      className="border-t border-zinc-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/30 p-8 text-center shadow-2xl shadow-violet-950/20 sm:p-12 lg:p-14">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-fuchsia-600/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-violet-600/15 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Jetzt starten
          </p>
          <h2
            id="cta-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Bereit, deinen Content zu skalieren?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Schließe dich 500+ Creators an. Melde dich mit Google an und starte in
            30 Sekunden mit {APP_NAME} — Trend-Scouting & KI-Tools inklusive.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GoogleSignInButton label="Kostenlos mit Google starten" />
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Oder Pläne vergleichen →
            </button>
          </div>

          <p className="mt-6 text-xs text-zinc-600">
            Keine Kreditkarte · Kostenloser Einstieg · Jederzeit upgraden
          </p>
        </div>
      </div>
    </section>
  )
}
