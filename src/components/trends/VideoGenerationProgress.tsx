import { cn } from '@/lib'
import type { VideoJobStatus } from '@/lib/video-generation-pipeline'

const STEPS: { id: VideoJobStatus; label: string }[] = [
  { id: 'queued', label: 'Warteschlange' },
  { id: 'generating', label: 'Generierung' },
  { id: 'completed', label: 'Fertig' },
]

function stepIndex(status: VideoJobStatus): number {
  if (status === 'failed') return 1
  if (status === 'idle') return -1
  return STEPS.findIndex((s) => s.id === status)
}

type VideoGenerationProgressProps = {
  status: VideoJobStatus
  detail?: string | null
  error?: string | null
  className?: string
  onCancel?: () => void
}

export function VideoGenerationProgress({
  status,
  detail,
  error,
  className,
  onCancel,
}: VideoGenerationProgressProps) {
  const active = stepIndex(status)
  const failed = status === 'failed'

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
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          AI Video Pipeline
        </p>
        {(status === 'queued' || status === 'generating') && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            Abbrechen
          </button>
        ) : null}
      </div>

      <div className="flex gap-2">
        {STEPS.map((step, i) => {
          const done = !failed && active > i
          const current = !failed && active === i
          return (
            <div key={step.id} className="flex flex-1 flex-col gap-1.5">
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
                  'text-[10px] font-medium',
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

      {(status === 'queued' || status === 'generating') && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
        </div>
      )}
    </div>
  )
}
