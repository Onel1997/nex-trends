import { useState } from 'react'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChartBarIcon, SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import {
  analyzeLandingPagePlaceholder,
  type LandingAuditResult,
} from '@/lib/ai-tools-placeholder'
import { cn } from '@/lib'
import { getViralScoreTone } from '@/lib/trend-intelligence'

export function LandingPageAnalyzerPage() {
  const {
    hasProAccess,
    isUsageLimitReached,
    requireCredits,
    consumeCreditAfterSuccess,
  } = useUsageLimit()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<LandingAuditResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function handleAnalyze() {
    if (!input.trim()) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      if (!requireCredits()) return

      const audit = await analyzeLandingPagePlaceholder(input.trim())
      setResult(audit)
      await consumeCreditAfterSuccess({
        tool: 'Landing Page Analyzer',
        label: `LP-Analyse: ${input.trim().slice(0, 40)}`,
        prompt: input.trim().slice(0, 500),
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const scoreTone = result ? getViralScoreTone(result.overallScore) : null

  return (
    <AiToolLayout
      title="Landing Page Analyzer"
      description="KI-CRO-Audit mit Scores, Stärken und konkreten Optimierungsvorschlägen — URL oder Seitentext einfügen."
    >
      <div className="glass-card p-5 sm:p-7">
        <label
          htmlFor="lp-analyzer-input"
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          URL oder Seiteninhalt
        </label>
        <Textarea
          id="lp-analyzer-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="https://deine-seite.de oder Haupttext der Landing Page …"
          disabled={isAnalyzing}
        />
        <Button
          variant="pro"
          size="lg"
          fullWidth
          loading={isAnalyzing}
          disabled={isAnalyzing || !input.trim()}
          onClick={() => void handleAnalyze()}
          className="mt-5"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {isAnalyzing ? 'Analysiert …' : 'Seite analysieren · 1 Credit'}
        </Button>
      </div>

      <section className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Audit-Ergebnis
        </p>

        {isUsageLimitReached && !hasProAccess ? (
          <UsageLimitWarning />
        ) : isAnalyzing ? (
          <div className="glass-card space-y-4 p-5">
            <Skeleton className="mx-auto size-24 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : result && scoreTone ? (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card flex flex-col items-center p-6 sm:flex-row sm:gap-8">
              <div
                className={cn(
                  'flex size-24 flex-col items-center justify-center rounded-full ring-2 ring-violet-500/30',
                  scoreTone.bgClass,
                )}
              >
                <span className={cn('text-3xl font-bold tabular-nums', scoreTone.textClass)}>
                  {result.overallScore}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  CRO Score
                </span>
              </div>
              <p className="mt-4 text-center text-sm text-zinc-400 sm:mt-0 sm:text-left">
                KI-geschätztes Conversion-Potenzial basierend auf Struktur, CTA und Trust-Signalen.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {result.categories.map((cat) => (
                <div
                  key={cat.name}
                  className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{cat.name}</span>
                    <span className="text-sm font-bold tabular-nums text-violet-300">
                      {cat.score}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">{cat.note}</p>
                </div>
              ))}
            </div>

            <AuditList title="Stärken" items={result.strengths} variant="success" />
            <AuditList title="Verbesserungen" items={result.improvements} variant="default" />
            <AuditList title="Quick Wins (24h)" items={result.quickWins} variant="accent" />
          </div>
        ) : (
          <EmptyState
            size="compact"
            title="Landing Page audit starten"
            description="Füge URL oder Copy ein — erhalte Scores und priorisierte CRO-Empfehlungen."
            icon={<ChartBarIcon className="size-5 text-violet-400/70" aria-hidden />}
          />
        )}
      </section>
    </AiToolLayout>
  )
}

function AuditList({
  title,
  items,
  variant,
}: {
  title: string
  items: string[]
  variant: 'success' | 'default' | 'accent'
}) {
  const border =
    variant === 'success'
      ? 'border-emerald-500/20'
      : variant === 'accent'
        ? 'border-violet-500/20 bg-violet-500/5'
        : 'border-zinc-800/50'

  return (
    <div className={cn('rounded-xl border p-4', border)}>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm text-zinc-300 before:mt-2 before:size-1 before:shrink-0 before:rounded-full before:bg-violet-400/80 before:content-['']"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
