import { memo, type ReactNode } from 'react'
import { AnimatedCounter } from '@/components/dashboard/os/AnimatedCounter'
import { getCroScoreTone } from '@/lib/landing-audit-score'
import type { LandingAuditResult } from '@/lib/landing-page-analyzer'
import { cn } from '@/lib'

function ContextChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-md border border-zinc-800/70 bg-zinc-900/80 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
      {children}
    </span>
  )
}

type LandingAuditScoreHeroProps = {
  result: LandingAuditResult
}

function LandingAuditScoreHeroInner({ result }: LandingAuditScoreHeroProps) {
  const tone = getCroScoreTone(result.overallScore)
  const pulse = result.overallScore >= 85

  return (
    <div className="lp-audit-hero glass-card relative overflow-hidden p-5 sm:flex sm:items-center sm:gap-8 sm:p-7">
      <div className="lp-audit-hero__glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex flex-col items-center sm:shrink-0">
        <div
          className={cn(
            'lp-score-ring flex size-28 flex-col items-center justify-center rounded-full ring-2 sm:size-32',
            tone.bgClass,
            tone.ringClass,
            tone.glowClass,
            pulse && 'lp-score-ring--pulse',
          )}
        >
          <AnimatedCounter
            key={result.overallScore}
            value={result.overallScore}
            duration={1100}
            className={cn('text-4xl font-bold sm:text-[2.75rem]', tone.textClass)}
          />
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            CRO Score
          </span>
        </div>
        <span
          className={cn(
            'mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            tone.bgClass,
            tone.textClass,
          )}
        >
          {tone.label}
        </span>
      </div>

      <div className="relative mt-5 min-w-0 text-center sm:mt-0 sm:text-left">
        <p className="text-sm leading-relaxed text-zinc-400">
          Context-aware audit for{' '}
          <span className="font-medium text-zinc-200">{result.businessLabel}</span> — recommendations
          match detected page signals, not generic templates.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
          <ContextChip>{result.businessLabel}</ContextChip>
          <ContextChip>{result.detectedNiche}</ContextChip>
          <ContextChip>
            {result.inputKind === 'url'
              ? 'URL'
              : result.inputKind === 'mixed'
                ? 'URL + Text'
                : 'Text'}
          </ContextChip>
          {result.domainHint ? <ContextChip>{result.domainHint}</ContextChip> : null}
        </div>
      </div>
    </div>
  )
}

export const LandingAuditScoreHero = memo(LandingAuditScoreHeroInner)
