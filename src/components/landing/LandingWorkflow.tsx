'use client'

import { LandingSection } from '@/components/landing/LandingSection'
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { LandingReveal } from '@/components/landing/LandingReveal'
import { WORKFLOW_STEPS } from '@/lib/landing'
import { cn } from '@/lib'

const WORKFLOW_PREVIEWS: Record<string, { label: string; value: string; bars?: number[] }> = {
  discover: { label: 'Trend Score', value: '94 · Explodiert', bars: [40, 55, 72, 88] },
  hook: { label: 'Hook Output', value: '„Stop — du machst das falsch."' },
  'ad-copy': { label: 'Ad Variants', value: '3 · Meta · Conversion' },
  seo: { label: 'SEO Title', value: 'CTR Prognose +18%' },
  analyzer: { label: 'CRO Score', value: '82 / 100 · 4 Quick Wins', bars: [65, 72, 78, 82] },
  studio: { label: 'Render Queue', value: '84% · Voiceover aktiv', bars: [30, 50, 70, 84] },
}

export function LandingWorkflow() {
  return (
    <LandingSection id="workflow" glow="top" ariaLabelledBy="workflow-heading">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="Workflow"
            title="So funktioniert NexTrends"
            description="Vom Trend-Signal bis zum fertigen Video — ein durchgängiger Creator-Pipeline in einem OS."
          />
        </LandingReveal>

        {/* Desktop pipeline */}
        <div className="landing-workflow-desktop mt-12 hidden lg:block">
          <ol className="relative mx-auto max-w-3xl space-y-0">
            {WORKFLOW_STEPS.map((step, index) => {
              const { Icon } = step
              const preview = WORKFLOW_PREVIEWS[step.id]
              const isLast = index === WORKFLOW_STEPS.length - 1

              return (
                <li key={step.id} className="relative flex gap-5 pb-6">
                  {!isLast && (
                    <span
                      className="absolute left-[1.375rem] top-14 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-violet-500/25 to-transparent"
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl border bg-zinc-950/90 shadow-sm transition-transform duration-300',
                      step.premium
                        ? 'border-cyan-500/25'
                        : 'border-violet-500/20',
                    )}
                  >
                    <Icon
                      className={cn('size-5', step.premium ? 'text-cyan-400' : 'text-violet-400/90')}
                      aria-hidden
                    />
                  </div>

                  <LandingReveal delay={index * 60} className="flex-1">
                    <article
                      className={cn(
                        'landing-workflow-card group rounded-2xl border p-5 transition-all duration-300',
                        step.premium
                          ? 'border-cyan-500/15 bg-gradient-to-br from-cyan-950/15 to-zinc-950/80 hover:border-cyan-500/25 hover:shadow-[0_12px_40px_-24px_rgba(34,211,238,0.2)]'
                          : 'border-zinc-800/60 bg-zinc-950/50 hover:border-violet-500/20 hover:shadow-[0_12px_40px_-24px_rgba(139,92,246,0.15)]',
                        'hover:-translate-y-0.5',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white">{step.title}</h3>
                            {step.premium && (
                              <span className="rounded-full border border-cyan-500/25 bg-cyan-500/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                                Studio exklusiv
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-zinc-500">{step.description}</p>
                        </div>
                        {!isLast && (
                          <span className="hidden text-zinc-700 xl:block" aria-hidden>↓</span>
                        )}
                      </div>

                      {preview && (
                        <div className="landing-workflow-mini mt-4 rounded-xl border border-white/[0.05] bg-black/25 p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                            {preview.label}
                          </p>
                          <p className="mt-1 text-xs text-zinc-300">{preview.value}</p>
                          {preview.bars && (
                            <div className="mt-2 flex h-5 items-end gap-0.5" aria-hidden>
                              {preview.bars.map((h, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    'flex-1 rounded-sm',
                                    step.premium ? 'bg-cyan-500/30' : 'bg-violet-500/30',
                                  )}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  </LandingReveal>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile horizontal swipe */}
        <div
          className="landing-workflow-carousel mt-10 flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-hide lg:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const { Icon } = step
            const preview = WORKFLOW_PREVIEWS[step.id]

            return (
              <article
                key={step.id}
                className={cn(
                  'landing-workflow-card w-[min(82vw,17rem)] shrink-0 snap-center rounded-2xl border p-4',
                  step.premium
                    ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-950/15 to-zinc-950/90'
                    : 'border-zinc-800/60 bg-zinc-950/60',
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl border',
                      step.premium
                        ? 'border-cyan-500/25 bg-cyan-500/10'
                        : 'border-violet-500/20 bg-violet-500/10',
                    )}
                  >
                    <Icon
                      className={cn('size-5', step.premium ? 'text-cyan-400' : 'text-violet-400/90')}
                      aria-hidden
                    />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-zinc-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{step.description}</p>
                {preview && (
                  <div className="landing-workflow-mini mt-3 rounded-lg border border-white/[0.04] bg-black/20 p-2.5">
                    <p className="text-[9px] text-zinc-600">{preview.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{preview.value}</p>
                  </div>
                )}
                {step.premium && (
                  <span className="mt-3 inline-block rounded-full border border-cyan-500/20 bg-cyan-500/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase text-cyan-300">
                    Studio exklusiv
                  </span>
                )}
              </article>
            )
          })}
        </div>
    </LandingSection>
  )
}
