'use client'

import { LandingCountUp } from '@/components/landing/LandingCountUp'
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
      className="landing-dashboard-section !pt-10 sm:!pt-14"
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

      <LandingReveal delay={100} className="mt-10 sm:mt-20">
        <div className="landing-dashboard-stage mx-auto w-full min-w-0 max-w-[min(100%,56rem)]">
          <div className="landing-dashboard-shell">
            <HeroDashboardPreview />
          </div>
        </div>
      </LandingReveal>

      <LandingReveal delay={180}>
        <ul
          className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-14 sm:gap-2.5"
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
        <dl className="mt-10 grid min-w-0 grid-cols-3 gap-2 sm:mt-16 sm:gap-5">
          {HERO_STATS.map(({ value, label }) => (
            <div
              key={label}
              className="landing-stat-card min-w-0 rounded-2xl px-2 py-4 text-center sm:px-5 sm:py-6"
            >
              <dt className="landing-stat-value text-lg font-bold min-[390px]:text-xl sm:text-3xl lg:text-4xl">
                <LandingCountUp value={value} />
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
