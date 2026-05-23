import { useState } from 'react'
import { CreditsUpgradeBox } from '@/components/dashboard/CreditsUpgradeBox'
import { SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type ToolGeneratorPanelProps = {
  title: string
  description: string
  briefingLabel?: string
  briefingPlaceholder: string
  resultPlaceholder: string
  credits: number
  decrementCredits: () => void
  onGenerate?: (briefing: string) => Promise<string>
  className?: string
}

export type ToolCreditsProps = Pick<
  ToolGeneratorPanelProps,
  'credits' | 'decrementCredits'
>

export function ToolGeneratorPanel({
  title,
  description,
  briefingLabel = 'Dein Briefing',
  briefingPlaceholder,
  resultPlaceholder,
  credits,
  decrementCredits,
  onGenerate,
  className,
}: ToolGeneratorPanelProps) {
  const [briefing, setBriefing] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const inputId = title.replace(/\s+/g, '-').toLowerCase()

  const hasNoCredits = credits <= 0

  const isError =
    result !== null &&
    (result.startsWith('VITE_OPENAI') ||
      result.startsWith('OpenAI') ||
      result.startsWith('Keine Antwort') ||
      result.startsWith('Bitte gib'))

  async function handleGenerate() {
    if (hasNoCredits) return

    if (!briefing.trim()) {
      setResult('Bitte gib ein Briefing ein.')
      return
    }

    if (!onGenerate) {
      setResult(resultPlaceholder)
      return
    }

    decrementCredits()
    setIsGenerating(true)
    setResult(null)

    try {
      const generated = await onGenerate(briefing.trim())
      setResult(generated)
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
    <section className={cn('max-w-3xl', className)}>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-base">
          {description}
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-6">
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
        >
          {briefingLabel}
        </label>
        <textarea
          id={inputId}
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
          rows={4}
          placeholder={briefingPlaceholder}
          disabled={isGenerating || hasNoCredits}
          className="w-full resize-none rounded-xl border border-zinc-800 bg-black/50 px-4 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 transition-colors focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || hasNoCredits}
          className={cn(
            'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 sm:w-auto',
            hasNoCredits
              ? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30 hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          <SparklesIcon className="size-4" aria-hidden />
          {isGenerating ? 'Generiert...' : 'Generieren'}
        </button>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            KI-Ergebnis
          </p>

          {hasNoCredits ? (
            <CreditsUpgradeBox />
          ) : (
            <div
              className={cn(
                'rounded-xl border p-4 sm:p-5',
                isError
                  ? 'border-red-500/30 bg-red-950/20'
                  : 'border-zinc-800/80 bg-zinc-950/80',
              )}
            >
              <p
                className={cn(
                  'whitespace-pre-wrap text-sm leading-relaxed',
                  result === null
                    ? 'text-zinc-400'
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
