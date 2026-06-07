import { memo } from 'react'
import { AiPulseIndicator } from '@/components/ui/AiPulseIndicator'
import { SparklesIcon } from '@/components/ui/icons'
import {
  ANALYZER_PIPELINE_STEPS,
  useAnalyzerLoadingPipeline,
} from '@/hooks/useAnalyzerLoadingPipeline'
import { cn } from '@/lib'

type LandingAnalyzerLoadingProps = {
  active: boolean
}

function LandingAnalyzerLoadingInner({ active }: LandingAnalyzerLoadingProps) {
  const { stepIndex, stepLabel, progress } = useAnalyzerLoadingPipeline(active)

  return (
    <div
      className="lp-analyzer-loading glass-card relative min-h-[22rem] overflow-hidden p-5 sm:min-h-[24rem] sm:p-7"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="lp-analyzer-loading__glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex flex-col items-center text-center">
        <div className="lp-analyzer-loading__orb flex size-16 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 shadow-[0_0_48px_-12px_rgba(139,92,246,0.55)] sm:size-[4.5rem]">
          <SparklesIcon className="size-7 text-violet-300 lp-analyzer-loading__icon" aria-hidden />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <AiPulseIndicator label="Analyzing" size="sm" />
          <p className="text-sm font-semibold tracking-tight text-zinc-100">Analyzing…</p>
        </div>
        <p className="mt-1 text-xs text-zinc-500">AI CRO audit in progress</p>
      </div>

      <div className="relative mt-6 sm:mt-8">
        <div className="lp-analyzer-progress-track h-2 overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="lp-analyzer-progress-fill h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-400 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-right text-[10px] font-medium tabular-nums text-zinc-500">
          {progress}%
        </p>
      </div>

      <ol className="relative mt-5 space-y-2 sm:mt-6">
        {ANALYZER_PIPELINE_STEPS.map((label, i) => {
          const done = i < stepIndex
          const current = i === stepIndex
          return (
            <li
              key={label}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300',
                current && 'border-violet-500/30 bg-violet-500/[0.07] lp-analyzer-step--active',
                done && 'border-zinc-800/40 bg-zinc-950/30 opacity-80',
                !done && !current && 'border-transparent bg-transparent opacity-40',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
                  done && 'bg-emerald-500/15 text-emerald-400',
                  current && 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30',
                  !done && !current && 'bg-zinc-800/80 text-zinc-600',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 text-left text-xs font-medium sm:text-[13px]',
                  current ? 'text-violet-100' : 'text-zinc-400',
                )}
              >
                {label}
                {current ? (
                  <span className="lp-analyzer-step-dots ml-1 inline-flex" aria-hidden>
                    …
                  </span>
                ) : null}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="relative mt-4 text-center text-[11px] text-zinc-600">
        {stepLabel}
      </p>
    </div>
  )
}

export const LandingAnalyzerLoading = memo(LandingAnalyzerLoadingInner)
