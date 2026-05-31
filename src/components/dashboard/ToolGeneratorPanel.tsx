import { useState } from 'react'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { LowCreditBanner } from '@/components/subscription/LowCreditBanner'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { runAiGenerationPipeline } from '@/lib/ai-generation-pipeline'
import { cn } from '@/lib'

type ToolGeneratorPanelProps = {
  title: string
  description: string
  briefingLabel?: string
  briefingPlaceholder: string
  resultPlaceholder: string
  onGenerate?: (briefing: string) => Promise<string>
  className?: string
}

export function ToolGeneratorPanel({
  title,
  description,
  briefingLabel = 'Dein Briefing',
  briefingPlaceholder,
  resultPlaceholder,
  onGenerate,
  className,
}: ToolGeneratorPanelProps) {
  const {
    isUsageLimitReached,
    isCreditsLow,
    usage,
    userPlan,
    requireCredits,
    consumeCreditAfterSuccess,
  } = useUsageLimit()
  const [briefing, setBriefing] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const inputId = title.replace(/\s+/g, '-').toLowerCase()

  const isError =
    result !== null &&
    (result.startsWith('VITE_OPENAI') ||
      result.startsWith('OpenAI') ||
      result.startsWith('Keine Antwort') ||
      result.startsWith('Bitte gib'))

  async function handleGenerate() {
    if (!briefing.trim()) {
      setResult('Bitte gib ein Briefing ein.')
      return
    }

    if (!onGenerate) {
      setResult(resultPlaceholder)
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      if (!requireCredits()) return

      const trimmed = briefing.trim()
      const generated = await runAiGenerationPipeline({
        tool: title,
        label: `${title}: Analyse gestartet`,
        generation_type: 'text',
        prompt: trimmed,
        run: () => onGenerate(trimmed),
      })
      setResult(generated)
      await consumeCreditAfterSuccess({
        tool: title,
        label: `${title}: Analyse gestartet`,
        prompt: trimmed.slice(0, 500),
        generation_type: 'text',
        skip_analytics_log: true,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unbekannter Fehler bei der Generierung.'
      setResult(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className={cn('max-w-3xl animate-fade-in', className)}>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          {description}
        </p>
      </header>

      {userPlan === 'free' && isCreditsLow && (
        <LowCreditBanner remaining={usage.remaining ?? 0} className="mb-5" />
      )}

      <div className="glass-card p-5 sm:p-7">
        <label
          htmlFor={inputId}
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          {briefingLabel}
        </label>
        <Textarea
          id={inputId}
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
          rows={4}
          placeholder={briefingPlaceholder}
          disabled={isGenerating}
        />

        <Button
          variant="pro"
          size="lg"
          fullWidth
          loading={isGenerating}
          disabled={isGenerating}
          onClick={() => void handleGenerate()}
          className="mt-5 sm:w-auto"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {isGenerating ? 'Generiert …' : 'Generieren · 1 Credit'}
        </Button>

        <div className="mt-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            KI-Ergebnis
          </p>

          {isUsageLimitReached && userPlan === 'free' ? (
            <UsageLimitWarning />
          ) : isGenerating ? (
            <div className="space-y-3 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div
              className={cn(
                'rounded-xl border p-5 transition-smooth sm:p-6',
                isError
                  ? 'border-red-500/30 bg-red-950/20'
                  : 'border-zinc-800/60 bg-zinc-950/60',
              )}
            >
              <p
                className={cn(
                  'whitespace-pre-wrap text-sm leading-relaxed',
                  result === null
                    ? 'text-zinc-500'
                    : isError
                      ? 'text-red-300'
                      : 'text-zinc-200',
                )}
              >
                {result ?? resultPlaceholder}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
