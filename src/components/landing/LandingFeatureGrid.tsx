'use client'

import { LandingReveal } from '@/components/landing/LandingReveal'
import { LandingSection } from '@/components/landing/LandingSection'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { LANDING_FEATURES } from '@/lib/landing'
import { cn } from '@/lib/utils'

export function LandingFeatureGrid() {
  return (
    <LandingSection id="feature-grid" glow="top" ariaLabelledBy="feature-grid-heading">
      <LandingReveal>
        <LandingSectionHeader
          eyebrow="Features"
          title="Alles, was Creator Teams brauchen"
          titleAccent="— modular & verbunden."
          description="Von Trend-Signalen bis AI Video: ein durchgängiges Toolkit mit Premium UX."
        />
      </LandingReveal>

      <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {LANDING_FEATURES.map((feature, index) => {
          const { Icon, title, description, benefit, premium, status } = feature
          return (
            <LandingReveal key={feature.id} delay={60 + index * 50}>
              <article
                className={cn(
                  'landing-glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 sm:p-6',
                  premium && 'landing-glass-card--cyan',
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute -right-10 -top-10 size-32 rounded-full blur-3xl transition-opacity duration-500',
                    premium
                      ? 'bg-cyan-500/20 opacity-50 group-hover:opacity-90'
                      : 'bg-violet-600/25 opacity-0 group-hover:opacity-80',
                  )}
                  aria-hidden
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'inline-flex size-11 items-center justify-center rounded-xl ring-1 transition-all duration-300',
                      premium
                        ? 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20 group-hover:bg-cyan-500/15'
                        : 'bg-violet-500/10 text-violet-400 ring-violet-500/15 group-hover:bg-violet-500/15 group-hover:ring-violet-500/30',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  {status ? (
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      {status}
                    </span>
                  ) : null}
                </div>

                <h3
                  id={index === 0 ? 'feature-grid-heading' : undefined}
                  className="landing-display relative mt-4 text-base font-semibold tracking-[-0.03em] text-white transition-colors group-hover:text-violet-50 sm:text-lg"
                >
                  {title}
                </h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                  {description}
                </p>
                <span
                  className={cn(
                    'relative mt-4 inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                    premium
                      ? 'border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-300'
                      : 'border-violet-500/15 bg-violet-500/[0.08] text-violet-300',
                  )}
                >
                  {benefit}
                </span>
              </article>
            </LandingReveal>
          )
        })}
      </div>
    </LandingSection>
  )
}
