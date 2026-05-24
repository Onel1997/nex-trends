import { useEffect, useState } from 'react'
import { cn } from '@/lib'

const STEPS = [
  'Nische & Zielgruppe analysieren',
  'TikTok & Instagram Signale scannen',
  'Viral Score & Velocity berechnen',
  'Content- & Hook-Insights generieren',
] as const

type TrendAnalysisLoadingProps = {
  className?: string
}

export function TrendAnalysisLoading({ className }: TrendAnalysisLoadingProps) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length)
    }, 900)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-500/20 bg-zinc-900/40 p-5 sm:p-6',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Trend-Analyse läuft"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
          <span className="relative size-8 animate-spin rounded-full border-2 border-zinc-800 border-t-violet-500 border-r-fuchsia-500/80" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Trend Intelligence läuft</p>
          <p className="mt-0.5 text-xs text-zinc-500">Geschätzte Metriken · KI-Analyse</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {STEPS.map((step, index) => {
          const isActive = index === activeStep
          const isDone = index < activeStep

          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-smooth',
                isActive && 'bg-violet-500/10 text-violet-200',
                isDone && 'text-zinc-500',
                !isActive && !isDone && 'text-zinc-600',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  isDone && 'bg-emerald-500/20 text-emerald-400',
                  isActive && 'bg-violet-500/25 text-violet-300',
                  !isDone && !isActive && 'bg-zinc-800 text-zinc-600',
                )}
                aria-hidden
              >
                {isDone ? '✓' : index + 1}
              </span>
              {step}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
