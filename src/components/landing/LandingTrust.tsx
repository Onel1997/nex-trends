'use client'

import { LOGO_CLOUD, TRUST_TEAMS } from '@/lib/landing'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingSection } from '@/components/landing/LandingSection'
import { TrustedCreatorsBadge } from '@/components/landing/TrustedCreatorsBadge'

export function LandingTrust() {
  return (
    <LandingSection
      id="trust"
      glow="bottom"
      className="!py-[4.5rem] sm:!py-20"
      ariaLabelledBy="trust-heading"
    >
      <LandingReveal>
        <div className="landing-trust-card mx-auto max-w-2xl rounded-2xl border border-white/[0.06] bg-zinc-950/40 px-5 py-6 backdrop-blur-xl sm:rounded-3xl sm:px-10 sm:py-10">
          <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400/90 sm:mb-6">
            Trusted by creators
          </p>
          <TrustedCreatorsBadge className="justify-center" />
          <h2 id="trust-heading" className="sr-only">
            Vertraut von Creator und Growth Teams
          </h2>

          <div className="mt-6 flex items-center justify-center gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="size-4 text-violet-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-xs font-medium text-zinc-500">4.9 · Creator Rating</span>
          </div>
        </div>
      </LandingReveal>

      <LandingReveal delay={80}>
        <ul className="mt-9 flex flex-wrap items-center justify-center gap-2 sm:mt-14 sm:gap-3">
          {TRUST_TEAMS.map((team) => (
            <li key={team}>
              <span className="landing-glass-pill text-zinc-400 hover:text-zinc-200">{team}</span>
            </li>
          ))}
        </ul>
      </LandingReveal>

      <LandingReveal delay={140}>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/[0.04] pt-8 sm:mt-12 sm:gap-x-10 sm:pt-10">
          {LOGO_CLOUD.map((name) => (
            <li
              key={name}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600 transition-colors duration-300 hover:text-zinc-400"
            >
              {name}
            </li>
          ))}
        </ul>
      </LandingReveal>
    </LandingSection>
  )
}
