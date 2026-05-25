import { cn } from '@/lib'
import { SpinnerInline } from '@/components/ui/Spinner'
import type { VideoJobStatus } from '@/lib/video-generation-pipeline'

const STEPS: { id: VideoJobStatus; label: string }[] = [
  { id: 'queued', label: 'Warteschlange' },
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
  error?: string | null
  provider?: string | null
  className?: string
  onCancel?: () => void
  onRetry?: () => void
}

export function VideoGenerationProgress({
  status,
  detail,
  error,
  provider,
  className,
  onCancel,
  onRetry,
}: VideoGenerationProgressProps) {
  const active = stepIndex(status)
  const failed = status === 'failed'
  const loading =
    status === 'queued' || status === 'generating' || status === 'processing'

  if (status === 'idle') return null

  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-800/60 bg-zinc-950/70 p-4',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {loading ? <SpinnerInline size="sm" className="text-violet-400" /> : null}
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            AI Video Pipeline
            {provider ? (
              <span className="ml-2 font-normal normal-case text-zinc-600">
                · {provider}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          {loading && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-zinc-500 transition hover:text-zinc-300"
            >
              Abbrechen
            </button>
          ) : null}
          {failed && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
            >
              Erneut versuchen
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1.5">
        {STEPS.map((step, i) => {
          const done = !failed && active > i
          const current = !failed && active === i
          return (
            <div key={step.id} className="flex flex-1 flex-col gap-1">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  done && 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
                  current && 'animate-pulse bg-violet-500/80',
                  !done && !current && 'bg-zinc-800',
                  failed && i <= 1 && 'bg-red-900/60',
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

      {detail ? (
        <p className="mt-3 text-sm text-zinc-400">{detail}</p>
      ) : null}

      {error ? (
        <p className="mt-2 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-300/90">
          {error}
        </p>
      ) : null}

      {loading && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full animate-progress-indeterminate rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600"
            style={{ width: '40%' }}
          />
        </div>
      )}
    </div>
  )
}
