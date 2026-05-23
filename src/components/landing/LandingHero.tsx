import { signInWithGoogle } from '@/lib/auth'

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pt-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[min(100vw,48rem)] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-32 size-72 rounded-full bg-fuchsia-600/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:border-violet-500/40 sm:text-sm">
          <span className="size-1.5 animate-pulse rounded-full bg-fuchsia-400" aria-hidden />
          KI-Marketing für TikTok & Instagram
        </p>

        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Verwandle Trends in{' '}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
            virale Marketing-Kampagnen
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-xl">
          NexTrends kombiniert Trend-Scouting mit leistungsstarken KI-Werkzeugen —
          damit du schneller publishst, besser konvertierst und mehr Reichweite
          erzielst.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="group inline-flex w-full min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-900/40 transition-all duration-300 hover:scale-[1.02] hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-800/50 sm:w-auto"
          >
            <GoogleIcon />
            Kostenlos mit Google starten
          </button>
        </div>

        <p className="mt-6 text-xs text-zinc-600 sm:text-sm">
          Keine Kreditkarte nötig · In 30 Sekunden startklar
        </p>
      </div>
    </section>
  )
}
