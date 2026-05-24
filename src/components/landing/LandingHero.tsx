import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { HERO_STATS, LOGO_CLOUD, TRUST_BADGES } from '@/lib/landing'
import { scrollToSection } from '@/lib/scroll'

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pt-28"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[min(100vw,52rem)] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-32 size-72 rounded-full bg-fuchsia-600/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 size-64 rounded-full bg-indigo-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 sm:text-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-fuchsia-400" aria-hidden />
            AI Marketing Suite · TikTok & Instagram
          </p>

          <h1
            id="hero-heading"
            className="animate-fade-in animation-delay-100 text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            Die AI-Plattform, die{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
              virale Trends in Umsatz
            </span>{' '}
            verwandelt
          </h1>

          <p className="animate-fade-in animation-delay-200 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-xl">
            Entdecke Trends, generiere scroll-stoppende Hooks & Ad Copy — alles in
            einer Suite. Von der Idee zum viralen Content in unter 2 Minuten.
          </p>

          <div className="animate-fade-in animation-delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GoogleSignInButton />
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              className="inline-flex w-full min-h-14 items-center justify-center rounded-xl border border-zinc-700 px-8 py-4 text-base font-semibold text-zinc-200 transition-all hover:border-zinc-600 hover:bg-zinc-900/80 sm:w-auto"
            >
              Pläne vergleichen
            </button>
          </div>

          <ul className="animate-fade-in animation-delay-400 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_BADGES.map((badge) => (
              <li key={badge} className="flex items-center gap-2 text-xs text-zinc-500 sm:text-sm">
                <span className="text-emerald-500" aria-hidden>
                  ✓
                </span>
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <dl className="animate-fade-in animation-delay-400 mt-16 grid grid-cols-3 gap-4 border-y border-zinc-800/80 py-8 sm:gap-8">
          {HERO_STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</dt>
              <dd className="mt-1 text-xs text-zinc-500 sm:text-sm">{label}</dd>
            </div>
          ))}
        </dl>

        <div className="animate-fade-in animation-delay-400 mt-10">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            Vertraut von Creators & Teams aus
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {LOGO_CLOUD.map((name) => (
              <li
                key={name}
                className="rounded-full border border-zinc-800/80 bg-zinc-950/60 px-4 py-1.5 text-xs font-medium text-zinc-500"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
