import { LOGO_CLOUD, TRUST_TEAMS } from '@/lib/landing'
import { LandingReveal } from '@/components/landing/LandingReveal'

export function LandingTrust() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="landing-trust relative border-t border-white/[0.04] px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <LandingReveal className="text-center">
          <h2 id="trust-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Vertraut von Creator & Growth Teams
          </h2>
        </LandingReveal>

        <LandingReveal delay={80}>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRUST_TEAMS.map((team) => (
              <li
                key={team}
                className="rounded-full border border-zinc-800/70 bg-zinc-950/50 px-3.5 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors duration-300 hover:border-zinc-700/80 hover:text-zinc-400"
              >
                {team}
              </li>
            ))}
          </ul>
        </LandingReveal>

        <LandingReveal delay={140}>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 opacity-70">
            {LOGO_CLOUD.map((name) => (
              <li
                key={name}
                className="text-[10px] font-medium uppercase tracking-wider text-zinc-600"
              >
                {name}
              </li>
            ))}
          </ul>
        </LandingReveal>
      </div>
    </section>
  )
}
