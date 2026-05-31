import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader'
import { WORKFLOW_STEPS } from '@/lib/landing'
import { cn } from '@/lib'

export function LandingWorkflow() {
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-heading"
      className="landing-section relative border-t border-white/[0.04] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <LandingSectionHeader
          eyebrow="Workflow"
          title="So funktioniert NexTrends"
          description="Vom Trend-Signal bis zum fertigen Video — ein durchgängiger Creator-Pipeline in einem OS."
        />

        {/* Desktop: vertical pipeline */}
        <div className="landing-workflow-desktop mt-12 hidden lg:block">
          <ol className="relative mx-auto max-w-2xl space-y-0">
            {WORKFLOW_STEPS.map((step, index) => {
              const { Icon } = step
              const isLast = index === WORKFLOW_STEPS.length - 1
              return (
                <li key={step.id} className="relative flex gap-6 pb-8">
                  {!isLast && (
                    <span
                      className="absolute left-6 top-14 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-violet-500/40 to-transparent"
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-zinc-950/80 shadow-lg transition-all duration-300',
                      step.premium
                        ? 'border-fuchsia-500/35 shadow-fuchsia-950/30'
                        : 'border-violet-500/25 shadow-violet-950/20',
                    )}
                  >
                    <Icon
                      className={cn('size-5', step.premium ? 'text-fuchsia-400' : 'text-violet-400')}
                      aria-hidden
                    />
                  </div>
                  <article
                    className={cn(
                      'landing-workflow-card group flex-1 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5',
                      step.premium
                        ? 'border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/20 to-zinc-950/80 hover:border-fuchsia-500/40 hover:shadow-[0_0_40px_-12px_rgba(217,70,239,0.35)]'
                        : 'border-zinc-800/70 bg-zinc-950/60 hover:border-violet-500/30 hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.25)]',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{step.title}</h3>
                      {step.premium && (
                        <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-fuchsia-300">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-500">{step.description}</p>
                  </article>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile + tablet: horizontal swipe */}
        <div
          className="landing-workflow-carousel mt-10 flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-hide lg:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {WORKFLOW_STEPS.map((step, index) => {
            const { Icon } = step
            return (
              <article
                key={step.id}
                className={cn(
                  'landing-workflow-card w-[min(78vw,16rem)] shrink-0 snap-center rounded-2xl border p-4 transition-all duration-300',
                  step.premium
                    ? 'border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/25 to-zinc-950/90'
                    : 'border-zinc-800/70 bg-zinc-950/70',
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl border',
                      step.premium
                        ? 'border-fuchsia-500/30 bg-fuchsia-500/10'
                        : 'border-violet-500/25 bg-violet-500/10',
                    )}
                  >
                    <Icon
                      className={cn('size-5', step.premium ? 'text-fuchsia-400' : 'text-violet-400')}
                      aria-hidden
                    />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-zinc-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{step.description}</p>
                {step.premium && (
                  <span className="mt-3 inline-block rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-fuchsia-300">
                    Premium
                  </span>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
