import { cn } from '@/lib'
import { SpinnerInline } from '@/components/ui/Spinner'
import { VIDEO_LOADING_MESSAGE } from '@/hooks/useVideoGeneration'
import type { VideoJobStatus } from '@/lib/video-generation-pipeline'

const STEPS: { id: VideoJobStatus; label: string }[] = [
  { id: 'queued', label: 'Briefing' },
  { id: 'generating', label: 'KI-Video' },
  { id: 'processing', label: 'Audio' },
  { id: 'completed', label: 'Fertig' },
]

function stepIndex(status: VideoJobStatus): number {
  if (status === 'failed') return 1
  if (status === 'idle') return -1
  const idx = STEPS.findIndex((s) => s.id === status)
  return idx >= 0 ? idx : 1
}

type VideoGenerationProgressProps = {
  status: VideoJobStatus
  detail?: string | null
  provider?: string | null
  className?: string
  onCancel?: () => void
}

export function VideoGenerationProgress({
  status,
  detail,
  provider,
  className,
  onCancel,
}: VideoGenerationProgressProps) {
  const active = stepIndex(status)
  const loading =
    status === 'queued' || status === 'generating' || status === 'processing'
  const loadingMessage = loading ? (detail?.trim() || VIDEO_LOADING_MESSAGE) : detail

  if (status === 'idle' || status === 'failed') return null

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-500/20 bg-gradient-to-br from-zinc-950/90 via-violet-950/20 to-zinc-950/90 p-4',
        'shadow-[0_0_32px_-16px_rgba(139,92,246,0.4)]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {loading ? (
            <SpinnerInline size="sm" className="text-violet-400" aria-hidden />
          ) : (
            <span
              className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
              aria-hidden
            />
          )}
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            AI Video Pipeline
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
            className="text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            Abbrechen
          </button>
        ) : null}
      </div>

      <div className="flex gap-1.5">
        {STEPS.map((step, i) => {
          const done = active > i
          const current = active === i
          return (
            <div key={step.id} className="flex flex-1 flex-col gap-1">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  done && 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
                  current && 'animate-pulse bg-violet-500/80',
                  !done && !current && 'bg-zinc-800',
                )}
              />
              <span
                className={cn(
                  'text-[9px] font-medium sm:text-[10px]',
                  current ? 'text-violet-300' : 'text-zinc-600',
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {loadingMessage ? (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-violet-500/15 bg-violet-500/5 px-3 py-2.5">
          {loading ? (
            <span className="relative mt-1.5 flex size-2 shrink-0 items-center justify-center">
              <span className="ai-pulse-ring absolute inset-0 rounded-full bg-violet-400/50" />
              <span className="relative size-1.5 rounded-full bg-violet-400" />
            </span>
          ) : null}
          <p className="text-sm leading-relaxed text-violet-200/90">{loadingMessage}</p>
        </div>
      ) : null}

      {loading && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full animate-progress-indeterminate rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.45)]"
            style={{ width: '40%' }}
          />
        </div>
      )}
    </div>
  )
}
