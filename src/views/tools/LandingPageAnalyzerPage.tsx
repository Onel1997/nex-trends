import { useCallback, useState } from 'react'
import {
  LandingAnalyzerEmptyState,
  LandingAnalyzerLoading,
  LandingAuditResults,
} from '@/components/landing-analyzer'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { ProtectedTool } from '@/components/subscription/ProtectedTool'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { analyzeLandingPagePlaceholder, type LandingAuditResult } from '@/lib/ai-tools-placeholder'

const EXAMPLE_AUDIT_INPUT = `https://nex-trends.app
NexTrends — AI Marketing Suite for TikTok & Instagram
Discover viral trends. Generate scroll-stopping hooks and ad copy.
Start free · No credit card required
Trusted by 500+ creators
FAQ · Pricing from €29/mo`

export function LandingPageAnalyzerPage() {
  const {
    isUsageLimitReached,
    userPlan,
    requireCredits,
    consumeCreditAfterSuccess,
  } = useUsageLimit()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<LandingAuditResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = useCallback(async () => {
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
  }, [input, requireCredits, consumeCreditAfterSuccess])

  const handleUseExample = useCallback(() => {
    setInput(EXAMPLE_AUDIT_INPUT)
    setResult(null)
  }, [])

  const showResults = result && !isAnalyzing
  const showLoading = isAnalyzing
  const showEmpty = !showResults && !showLoading && !(isUsageLimitReached && userPlan === 'free')

  return (
    <ProtectedTool
      toolId="analyzer"
      title="Landing Page Analyzer"
      description="Premium KI-CRO-Audit mit kontextbezogenen Scores, Stärken und priorisierten Quick Wins — ab Pro Creator."
    >
      <AiToolLayout
        title="Landing Page Analyzer"
        description="Premium KI-CRO-Audit — kontextbezogene Scores, Stärken und priorisierte Quick Wins aus URL oder Seiteninhalt."
        className="lp-analyzer-page"
      >
        <div className="glass-card lp-analyzer-input p-5 sm:p-7">
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
            placeholder="https://deine-seite.de oder Hero-Headline, CTA und wichtige Abschnitte einfügen …"
            disabled={isAnalyzing}
          />
          <Button
            variant="pro"
            size="lg"
            fullWidth
            loading={isAnalyzing}
            disabled={isAnalyzing || !input.trim()}
            onClick={() => void handleAnalyze()}
            className="mt-5 min-h-12"
          >
            <SparklesIcon className="size-4" aria-hidden />
            {isAnalyzing ? 'Analysiert …' : 'CRO-Audit starten · 1 Credit'}
          </Button>
        </div>

        <section className="lp-analyzer-output mt-6 sm:mt-8" aria-live="polite">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Audit-Ergebnisse
          </p>

          <div className="lp-analyzer-output__frame min-h-[22rem] sm:min-h-[24rem]">
            {isUsageLimitReached && userPlan === 'free' ? (
              <UsageLimitWarning />
            ) : showLoading ? (
              <LandingAnalyzerLoading active={isAnalyzing} />
            ) : showResults ? (
              <LandingAuditResults result={result} />
            ) : showEmpty ? (
              <LandingAnalyzerEmptyState onUseExample={handleUseExample} />
            ) : null}
          </div>
        </section>
      </AiToolLayout>
    </ProtectedTool>
  )
}
