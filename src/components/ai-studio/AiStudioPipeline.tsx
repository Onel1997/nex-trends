import { useEffect, useRef } from 'react'
import { cn } from '@/lib'
import { VideoGenerationPlaceholder } from '@/components/ui/loading-states'
import { Skeleton } from '@/components/ui/Skeleton'
import { CheckIcon } from '@/components/ui/icons'
import type { VideoJobStatus } from '@/lib/video-generation-pipeline'

const STUDIO_STEPS = [
  { id: 'queue', label: 'Queue' },
  { id: 'script', label: 'Script' },
  { id: 'video', label: 'AI Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'render', label: 'Rendering' },
  { id: 'done', label: 'Finished' },
] as const

const LAST_STEP_INDEX = STUDIO_STEPS.length - 1

const AI_PHASE_MESSAGES = [
  'AI Video wird generiert …',
  'Script & Hook werden geschrieben …',
  'KI rendert cinematic Szenen …',
  'Voiceover wird generiert …',
  'Captions & Final Render …',
  'Virale Hooks werden optimiert …',
] as const

function getAiPhaseMessage(
  detail: string | null | undefined,
  active: number,
  loading: boolean,
): string {
  if (detail?.trim()) return detail
  if (!loading || active < 0) return ''
  return AI_PHASE_MESSAGES[active] ?? 'AI is crafting your video…'
}

function studioStepIndex(status: VideoJobStatus, detail?: string | null): number {
  if (status === 'idle') return -1
  if (status === 'failed') return 2
  if (status === 'queued') return 0
  if (status === 'generating') {
    const d = (detail ?? '').toLowerCase()
    if (d.includes('prompt') || d.includes('script') || d.includes('brief')) return 1
    return 2
  }
  if (status === 'processing') {
    const d = (detail ?? '').toLowerCase()
    if (d.includes('voice') || d.includes('musik') || d.includes('audio')) return 3
    return 4
  }
  if (status === 'completed') return LAST_STEP_INDEX
  return 0
}

function isStepCompleted(
  i: number,
  active: number,
  failed: boolean,
  status: VideoJobStatus,
): boolean {
  if (failed) return false
  if (active > i) return true
  return status === 'completed' && i === LAST_STEP_INDEX
}

type PipelineStepBadgeProps = {
  completed: boolean
  active: boolean
  success: boolean
}

function PipelineStepBadge({ completed, active, success }: PipelineStepBadgeProps) {
  if (completed) {
    return (
      <CheckIcon
        className={cn(
          'studio-pipeline-check size-3.5 sm:size-4',
          success && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]',
        )}
        aria-hidden
      />
    )
  }

  if (active) {
    return (
      <span
        className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse-soft"
        aria-hidden
      />
    )
  }

  return <span className="size-1.5 rounded-full bg-zinc-600/80" aria-hidden />
}

type AiStudioPipelineProps = {
  status: VideoJobStatus
  detail?: string | null
  provider?: string | null
  className?: string
  onCancel?: () => void
  onRetry?: () => void
}

export function AiStudioPipeline({
  status,
  detail,
  provider,
  className,
  onCancel,
  onRetry,
}: AiStudioPipelineProps) {
  const active = studioStepIndex(status, detail)
  const prevActive = useRef(active)
  const failed = status === 'failed'
  const succeeded = status === 'completed'
  const loading =
    status === 'queued' || status === 'generating' || status === 'processing'

  useEffect(() => {
    prevActive.current = active
  }, [active])

  if (status === 'idle') return null

  const stepJustChanged = prevActive.current !== active
  const phaseMessage = getAiPhaseMessage(detail, active, loading)

  return (
    <div
      className={cn(
        'glass-card glass-premium animate-fade-in-scale border-violet-500/20 p-4 sm:p-5',
        'shadow-[0_0_48px_-20px_rgba(139,92,246,0.35)]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="size-2 shrink-0 rounded-full" aria-hidden />
          ) : failed ? (
            <span className="size-2 rounded-full bg-amber-500" aria-hidden />
          ) : (
            <span
              className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
              aria-hidden
            />
          )}
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Generation pipeline
            {provider ? (
              <span className="ml-2 font-normal normal-case text-zinc-600">
                · {provider}
              </span>
            ) : null}
          </p>
        </div>
        {loading && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="btn-press rounded-lg px-2 py-1 text-xs text-zinc-500 transition-smooth hover:bg-zinc-800/50 hover:text-zinc-300"
          >
            Abbrechen
          </button>
        ) : null}
        {failed && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/20"
          >
            Erneut versuchen
          </button>
        ) : null}
      </div>

      {loading && (
        <div className="mb-4 sm:hidden" aria-hidden>
          <VideoGenerationPlaceholder compact />
        </div>
      )}

      <div className="relative">
        <div
          className="pointer-events-none absolute left-[8%] right-[8%] top-[1.65rem] hidden h-0.5 sm:block"
          aria-hidden
        >
          <div className="h-full rounded-full bg-zinc-800/80" />
          {active >= 0 && !failed && (
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                succeeded
                  ? 'bg-gradient-to-r from-violet-600/90 via-emerald-500/70 to-fuchsia-500/90'
                  : 'bg-gradient-to-r from-violet-600/80 to-fuchsia-500/80',
              )}
              style={{
                width: `${Math.min(100, (active / LAST_STEP_INDEX) * 100)}%`,
              }}
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-1.5">
          {STUDIO_STEPS.map((step, i) => {
            const completed = isStepCompleted(i, active, failed, status)
            const isActive = !failed && active === i && !completed
            const isSuccess = succeeded && step.id === 'done' && completed
            const connectorActive = !failed && active === i + 1

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                {i > 0 && (
                  <span
                    className={cn(
                      'absolute -left-[calc(50%+4px)] top-[1.65rem] hidden h-0.5 w-[calc(100%+8px)] rounded-full sm:block',
                      completed && 'bg-violet-500/50',
                      isSuccess && 'bg-emerald-500/40',
                      connectorActive && 'studio-pipeline-connector--active',
                      !completed && !connectorActive && 'bg-transparent',
                    )}
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    'studio-pipeline-step flex w-full flex-col items-center gap-2 rounded-xl border px-1 py-2.5 transition-all duration-500 sm:py-3',
                    completed && !isSuccess && 'border-violet-500/25 bg-violet-500/10',
                    isSuccess && 'studio-pipeline-step--success',
                    isActive && 'studio-pipeline-step--active border-violet-500/45 bg-violet-500/15',
                    stepJustChanged && isActive && 'studio-pipeline-step--enter',
                    !completed && !isActive && 'border-zinc-800/50 bg-zinc-950/40',
                    failed && i <= active && 'border-red-900/40 bg-red-950/20',
                  )}
                >
                  <div
                    className={cn(
                      'studio-pipeline-step__badge flex size-7 items-center justify-center rounded-full transition-all duration-500 sm:size-8',
                      completed &&
                        !isSuccess &&
                        'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/40',
                      isSuccess && 'studio-pipeline-step__badge--success text-white',
                      isActive &&
                        'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white',
                      !completed && !isActive && 'border border-zinc-700/80 bg-zinc-800/90',
                    )}
                    aria-hidden
                  >
                    <PipelineStepBadge
                      completed={completed}
                      active={isActive}
                      success={isSuccess}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-center text-[9px] font-semibold leading-tight transition-colors duration-500 sm:text-[10px]',
                      isSuccess && 'text-emerald-300/95',
                      isActive && !isSuccess && 'text-violet-200',
                      completed && !isSuccess && 'text-zinc-400',
                      !completed && !isActive && 'text-zinc-600',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {loading && (
        <div className="mt-4 hidden sm:block" aria-hidden>
          <VideoGenerationPlaceholder compact className="max-w-xs" />
        </div>
      )}

      {phaseMessage ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-violet-500/15 bg-violet-500/5 px-3.5 py-3">
          {loading ? (
            <span className="relative mt-1.5 flex size-2 shrink-0 items-center justify-center">
              <span className="ai-pulse-ring absolute inset-0 rounded-full bg-violet-400/50" />
              <span className="relative size-1.5 rounded-full bg-violet-400" />
            </span>
          ) : null}
          <p
            key={phaseMessage}
            className="animate-fade-in text-sm leading-relaxed text-violet-200/90"
          >
            {phaseMessage}
          </p>
        </div>
      ) : succeeded ? (
        <p className="mt-4 animate-fade-in text-sm font-medium text-emerald-300/90">
          Dein AI Video ist bereit — cinematic Quality unlocked.
        </p>
      ) : null}

      {loading && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="h-full animate-progress-indeterminate rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
            style={{ width: '45%' }}
          />
        </div>
      )}
    </div>
  )
}
