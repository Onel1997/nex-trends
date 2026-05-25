import { useState } from 'react'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { cn } from '@/lib'

type AiGeneratorToolProps = {
  title: string
  description: string
  inputLabel?: string
  inputPlaceholder: string
  emptyTitle?: string
  emptyDescription?: string
  generateLabel?: string
  onGenerate: (input: string) => Promise<string>
  toolActivityName: string
}

export function AiGeneratorTool({
  title,
  description,
  inputLabel = 'Dein Briefing',
  inputPlaceholder,
  emptyTitle = 'Bereit für KI-Magie',
  emptyDescription = 'Beschreibe dein Thema und starte die Generierung — 1 Credit pro Durchlauf.',
  generateLabel = 'Generieren',
  onGenerate,
  toolActivityName,
}: AiGeneratorToolProps) {
  const { hasProAccess, isUsageLimitReached, consumeUsage } = useUsageLimit()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const inputId = `ai-tool-${title.replace(/\s+/g, '-').toLowerCase()}`

  async function handleGenerate() {
    if (!input.trim()) return

    setIsGenerating(true)
    setResult(null)

    try {
      const usageResult = await consumeUsage({
        tool: toolActivityName,
        label: `${toolActivityName}: ${input.trim().slice(0, 40)}`,
      })
      if (!usageResult.allowed) return

      const generated = await onGenerate(input.trim())
      setResult(generated)
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Generierung fehlgeschlagen.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AiToolLayout title={title} description={description}>
      <div className="glass-card p-5 sm:p-7">
        <label
          htmlFor={inputId}
          className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
        >
          {inputLabel}
        </label>
        <Textarea
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={inputPlaceholder}
          disabled={isGenerating}
        />

        <Button
          variant="pro"
          size="lg"
          fullWidth
          loading={isGenerating}
          disabled={isGenerating || !input.trim()}
          onClick={() => void handleGenerate()}
          className="mt-5"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {isGenerating ? 'Generiert …' : `${generateLabel} · 1 Credit`}
        </Button>
      </div>

      <section className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Ergebnis
        </p>

        {isUsageLimitReached && !hasProAccess ? (
          <UsageLimitWarning />
        ) : isGenerating ? (
          <div className="glass-card space-y-3 p-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : result ? (
          <div className="glass-card p-5 sm:p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-200">
              {result}
            </pre>
          </div>
        ) : (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={<SparklesIcon className="size-5 text-violet-400/70" aria-hidden />}
            size="compact"
            className={cn('border-zinc-800/50')}
          />
        )}
      </section>
    </AiToolLayout>
  )
}
