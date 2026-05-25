import { useState } from 'react'
import { AiToolLayout } from '@/components/tools/AiToolLayout'
import { UsageLimitWarning } from '@/components/subscription/UsageLimitWarning'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SparklesIcon } from '@/components/ui/icons'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { runAiGenerationPipeline, type PipelineStatus } from '@/lib/ai-generation-pipeline'
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

function pipelineLabel(status: PipelineStatus, detail: string | null, fallback: string): string {
  if (detail) return detail
  if (status === 'queued') return 'In Warteschlange …'
  if (status === 'generating') return 'Generiert …'
  if (status === 'failed') return 'Fehlgeschlagen'
  return fallback
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
  const {
    hasProAccess,
    isUsageLimitReached,
    requireCredits,
    consumeCreditAfterSuccess,
  } = useUsageLimit()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle')
  const [pipelineDetail, setPipelineDetail] = useState<string | null>(null)
  const inputId = `ai-tool-${title.replace(/\s+/g, '-').toLowerCase()}`

  async function handleGenerate() {
    if (!input.trim()) return

    setIsGenerating(true)
    setResult(null)
    setPipelineStatus('idle')
    setPipelineDetail(null)

    try {
      if (!requireCredits()) return

      const trimmed = input.trim()
      const generated = await runAiGenerationPipeline({
        tool: toolActivityName,
        label: `${toolActivityName}: ${trimmed.slice(0, 40)}`,
        generation_type: 'text',
        prompt: trimmed,
        onStatus: (status, detail) => {
          setPipelineStatus(status)
          setPipelineDetail(detail ?? null)
        },
        run: () => onGenerate(trimmed),
      })

      setResult(generated)
      await consumeCreditAfterSuccess({
        tool: toolActivityName,
        label: `${toolActivityName}: ${trimmed.slice(0, 40)}`,
        prompt: trimmed.slice(0, 500),
        generation_type: 'text',
        skip_analytics_log: true,
      })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Generierung fehlgeschlagen — Provider nicht erreichbar. Bitte später erneut versuchen.'
      setResult(message)
      setPipelineStatus('failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const busy = isGenerating

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
          disabled={busy}
        />

        <Button
          variant="pro"
          size="lg"
          fullWidth
          loading={busy}
          disabled={busy || !input.trim()}
          onClick={() => void handleGenerate()}
          className="mt-5"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {busy
            ? pipelineLabel(pipelineStatus, pipelineDetail, 'Generiert …')
            : `${generateLabel} · 1 Credit`}
        </Button>

        {busy && pipelineStatus === 'failed' && pipelineDetail ? (
          <p className="mt-3 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-300/90">
            {pipelineDetail}
          </p>
        ) : null}
      </div>

      <section className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Ergebnis
        </p>

        {isUsageLimitReached && !hasProAccess ? (
          <UsageLimitWarning />
        ) : busy ? (
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
