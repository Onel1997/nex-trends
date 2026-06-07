'use client'

import { useCallback, useState } from 'react'
import { CodeBlock } from '@/components/code/CodeBlock'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { Badge } from '@/components/ui/Badge'
import {
  BoltIcon,
  ClockIcon,
  CodeBracketIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCodeGenerationFlow } from '@/hooks/useCodeGenerationFlow'
import { useCodeHistory } from '@/hooks/useCodeHistory'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { cn } from '@/lib'
import {
  CODE_FRAMEWORK_OPTIONS,
  CODE_GENERATION_COST,
  CODE_OUTPUT_TYPE_OPTIONS,
  type CodeFramework,
  type CodeGeneration,
  type CodeOutputType,
} from '@/types/code-generation'

function formatHistoryDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function AdminCodeGeneratorPanel() {
  const { isAdmin, unlimited } = useUsageLimit()
  const {
    generation,
    summary,
    status,
    error,
    isGenerating,
    generate,
    loadFromHistory,
  } = useCodeGenerationFlow()
  const { history, isLoading: historyLoading, error: historyError, refresh } = useCodeHistory()

  const [projectDescription, setProjectDescription] = useState('')
  const [framework, setFramework] = useState<CodeFramework>('React')
  const [outputType, setOutputType] = useState<CodeOutputType>('Component')

  const canGenerate = projectDescription.trim().length >= 10

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return

    const result = await generate({
      projectDescription: projectDescription.trim(),
      framework,
      outputType,
    })

    if (result) {
      void refresh()
    }
  }, [canGenerate, framework, generate, isGenerating, outputType, projectDescription, refresh])

  if (!isAdmin) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="admin">Internal Tool</Badge>
          <Badge variant="default">Admin Only</Badge>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300">
            <CodeBracketIcon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              AI Code Generator
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Internes Admin-Tool zum Testen von Code-Generierung mit OpenAI — produktionsreifer
              Output für React, Next.js, Tailwind und mehr.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-950/60 px-3 py-1.5 text-xs">
          <SparklesIcon className="size-3.5 text-violet-400/80" aria-hidden />
          {unlimited ? (
            <span className="text-zinc-400">
              Admin · <span className="font-medium text-amber-300">unbegrenzt</span>
            </span>
          ) : (
            <span className="text-zinc-400">
              <span className="font-semibold tabular-nums text-violet-300">
                {CODE_GENERATION_COST}
              </span>{' '}
              Credit pro Generierung
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="glass-card space-y-5 p-4 sm:p-6">
          <div>
            <label
              htmlFor="admin-code-description"
              className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-600"
            >
              Project Description
            </label>
            <Textarea
              id="admin-code-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={5}
              placeholder="Beschreibe das Projekt, Features, Styling und technische Anforderungen …"
              disabled={isGenerating}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value as CodeFramework)}
              options={CODE_FRAMEWORK_OPTIONS}
              disabled={isGenerating}
            />
            <SelectField
              label="Output Type"
              value={outputType}
              onChange={(e) => setOutputType(e.target.value as CodeOutputType)}
              options={CODE_OUTPUT_TYPE_OPTIONS}
              disabled={isGenerating}
            />
          </div>

          <Button
            type="button"
            onClick={() => void handleGenerate()}
            loading={isGenerating}
            disabled={!canGenerate}
            className="w-full sm:w-auto"
          >
            <BoltIcon className="size-4" aria-hidden />
            {isGenerating ? 'Generiert Code …' : 'Generate Code'}
          </Button>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          {isGenerating ? (
            <div className="space-y-3" aria-busy="true" aria-live="polite">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : null}

          {!isGenerating && generation ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full border border-zinc-800/70 bg-zinc-900/60 px-2.5 py-1">
                  {generation.framework}
                </span>
                <span className="rounded-full border border-zinc-800/70 bg-zinc-900/60 px-2.5 py-1">
                  {generation.outputType}
                </span>
                {summary ? <span className="text-zinc-400">{summary}</span> : null}
              </div>
              <CodeBlock code={generation.code} language={generation.language} />
            </div>
          ) : null}

          {!isGenerating && status === 'idle' && !generation ? (
            <div className="rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-950/40 px-4 py-10 text-center">
              <CodeBracketIcon className="mx-auto size-8 text-zinc-700" aria-hidden />
              <p className="mt-3 text-sm font-medium text-zinc-300">Bereit für Code-Generierung</p>
              <p className="mt-1 text-xs text-zinc-500">
                Beschreibe dein Projekt und wähle Framework sowie Output-Typ.
              </p>
            </div>
          ) : null}
        </section>

        <aside className="glass-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4 text-violet-400/80" aria-hidden />
              <h2 className="text-sm font-semibold text-white">Verlauf</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void refresh()}
              disabled={historyLoading}
            >
              Aktualisieren
            </Button>
          </div>

          {historyError ? (
            <p className="text-sm text-red-300">{historyError}</p>
          ) : null}

          {historyLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-zinc-500">Noch keine Generierungen gespeichert.</p>
          ) : (
            <ul className="max-h-[min(70vh,28rem)] space-y-2 overflow-y-auto pr-1">
              {history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  active={generation?.id === item.id}
                  onSelect={() => loadFromHistory(item)}
                />
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}

function HistoryItem({
  item,
  active,
  onSelect,
}: {
  item: CodeGeneration
  active: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full rounded-xl border px-3 py-3 text-left transition-smooth',
          active
            ? 'border-violet-500/35 bg-violet-500/10'
            : 'border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/50',
        )}
      >
        <p className="line-clamp-2 text-sm font-medium text-zinc-100">
          {item.projectDescription}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
          <span>{item.framework}</span>
          <span aria-hidden>·</span>
          <span>{item.outputType}</span>
          <span aria-hidden>·</span>
          <span>{formatHistoryDate(item.createdAt)}</span>
        </div>
      </button>
    </li>
  )
}
