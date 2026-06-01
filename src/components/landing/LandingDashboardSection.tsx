'use client'

import { HeroDashboardPreview } from '@/components/landing/HeroDashboardPreview'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingSection } from '@/components/landing/LandingSection'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { HERO_PILLS, HERO_STATS } from '@/lib/landing'

export function LandingDashboardSection() {
  return (
    <LandingSection
      id="dashboard"
      glow="center"
      className="landing-dashboard-section"
      ariaLabelledBy="dashboard-heading"
    >
      <LandingReveal>
        <LandingSectionHeader
          eyebrow="Creator OS"
          title="Dein AI Command Center"
          titleAccent="in einer Oberfläche."
          description="Viral Scores, Engagement Analytics, Trend Velocity und AI Hooks — alles in einem futuristischen Dashboard, das sich wie eine echte Marketing-Plattform anfühlt."
        />
      </LandingReveal>

      <LandingReveal delay={100} className="relative mt-14 sm:mt-20">
        <div
          className="pointer-events-none absolute -inset-x-12 top-1/4 h-3/4 bg-gradient-to-b from-violet-600/30 via-purple-600/12 to-transparent blur-3xl"
          aria-hidden
        />

        <div className="landing-dashboard-float-wrap mx-auto max-w-5xl">
          <div className="landing-dashboard-float">
            <div className="landing-glass-panel landing-dashboard-frame rounded-[1.25rem] p-1 sm:rounded-[1.5rem] sm:p-1.5">
              <HeroDashboardPreview />
            </div>
          </div>
        </div>
      </LandingReveal>

      <LandingReveal delay={180}>
        <ul
          className="mt-12 flex flex-wrap justify-center gap-2 sm:mt-14 sm:gap-2.5"
          aria-label="Produktfunktionen"
        >
          {HERO_PILLS.map((pill) => (
            <li key={pill}>
              <span className="landing-glass-pill">{pill}</span>
            </li>
          ))}
        </ul>
      </LandingReveal>

      <LandingReveal delay={240}>
        <dl className="mt-14 grid grid-cols-3 gap-3 sm:mt-16 sm:gap-5">
          {HERO_STATS.map(({ value, label }) => (
            <div
              key={label}
              className="landing-stat-card rounded-2xl px-3 py-5 text-center sm:px-5 sm:py-6"
            >
              <dt className="landing-stat-value text-xl font-bold tabular-nums sm:text-3xl lg:text-4xl">
                {value}
              </dt>
              <dd className="mt-2 text-[10px] font-medium leading-snug text-zinc-500 sm:text-xs">
                {label}
              </dd>
            </div>
          ))}
        </dl>
      </LandingReveal>
    </LandingSection>
  )
}
