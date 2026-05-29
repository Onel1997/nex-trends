import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import { ChartBarIcon, SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

const EXAMPLE_CATEGORIES = [
  { name: 'Clarity', score: 78 },
  { name: 'CTA', score: 64 },
  { name: 'Trust', score: 71 },
] as const

type LandingAnalyzerEmptyStateProps = {
  onUseExample?: () => void
  className?: string
}

function LandingAnalyzerEmptyStateInner({
  onUseExample,
  className,
}: LandingAnalyzerEmptyStateProps) {
  return (
    <div
      className={cn(
        'lp-analyzer-empty glass-card relative overflow-hidden p-5 sm:p-8',
        className,
      )}
    >
      <div className="lp-analyzer-empty__glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/8 shadow-[0_0_40px_-14px_rgba(139,92,246,0.5)]">
          <ChartBarIcon className="size-7 text-violet-400/90" aria-hidden />
        </div>

        <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
          Paste a URL to analyze your landing page
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
          Get a context-aware CRO audit with scores, strengths, and prioritized quick wins —
          no generic SaaS advice.
        </p>

        {onUseExample ? (
          <Button
            variant="secondary"
            size="md"
            onClick={onUseExample}
            className="mt-5 min-h-11"
          >
            <SparklesIcon className="size-4" aria-hidden />
            Try example audit
          </Button>
        ) : null}
      </div>

      <div
        className="relative mt-8 rounded-xl border border-zinc-800/50 bg-zinc-950/40 p-4 opacity-70"
        aria-hidden
      >
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Example preview
        </p>
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-violet-500/10 ring-2 ring-violet-500/25">
            <span className="text-xl font-bold tabular-nums text-violet-300">72</span>
            <span className="text-[8px] uppercase tracking-wider text-zinc-600">CRO</span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {EXAMPLE_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">{cat.name}</span>
                  <span className="font-semibold tabular-nums text-zinc-400">{cat.score}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const LandingAnalyzerEmptyState = memo(LandingAnalyzerEmptyStateInner)
