import { useEffect, useState } from 'react'
import { cn } from '@/lib'

const STEPS = [
  'Analyzing creator signals…',
  'Detecting viral momentum…',
  'Mapping audience interest…',
  'Calculating opportunity score…',
] as const

type TrendAnalysisLoadingProps = {
  className?: string
}

export function TrendAnalysisLoading({ className }: TrendAnalysisLoadingProps) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length)
    }, 1100)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.08] via-zinc-950/50 to-zinc-950/30 p-5 shadow-[0_0_60px_-20px_rgba(139,92,246,0.55)] backdrop-blur-xl sm:p-6',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Trend Intelligence wird analysiert"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-11 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/25" />
          <span className="relative size-9 animate-spin rounded-full border-2 border-zinc-800 border-t-violet-500 border-r-fuchsia-500/80" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">AI Trend Intelligence</p>
          <p className="mt-0.5 text-xs text-violet-300/80">{STEPS[activeStep]}</p>
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
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-smooth',
                isActive && 'bg-violet-500/12 text-violet-100 ring-1 ring-violet-500/20',
                isDone && 'text-zinc-500',
                !isActive && !isDone && 'text-zinc-600',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  isDone && 'bg-emerald-500/20 text-emerald-400',
                  isActive && 'bg-violet-500/30 text-violet-200 animate-pulse-soft',
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-shimmer rounded-xl bg-zinc-800/35"
            style={{ animationDelay: `${i * 120}ms` }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}
