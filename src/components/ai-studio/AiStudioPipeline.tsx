import { cn } from '@/lib'
import { SpinnerInline } from '@/components/ui/Spinner'
import type { VideoJobStatus } from '@/lib/video-generation-pipeline'

const STUDIO_STEPS = [
  { id: 'queue', label: 'Queue' },
  { id: 'script', label: 'Script' },
  { id: 'video', label: 'AI Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'render', label: 'Rendering' },
  { id: 'done', label: 'Finished' },
] as const

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
  if (status === 'completed') return 5
  return 0
}

type AiStudioPipelineProps = {
  status: VideoJobStatus
  detail?: string | null
  error?: string | null
  provider?: string | null
  className?: string
  onCancel?: () => void
}

export function AiStudioPipeline({
  status,
  detail,
  error,
  provider,
  className,
  onCancel,
}: AiStudioPipelineProps) {
  const active = studioStepIndex(status, detail)
  const failed = status === 'failed'
  const loading =
    status === 'queued' || status === 'generating' || status === 'processing'

  if (status === 'idle') return null

  return (
    <div
      className={cn(
        'glass-card animate-fade-in border-violet-500/15 p-4 sm:p-5',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {loading ? (
            <SpinnerInline size="sm" className="text-violet-400" />
          ) : failed ? (
            <span className="size-2 rounded-full bg-amber-500" aria-hidden />
          ) : (
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" aria-hidden />
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
            className="text-xs text-zinc-500 transition-smooth hover:text-zinc-300"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-1.5">
        {STUDIO_STEPS.map((step, i) => {
          const done = !failed && active > i
          const current = !failed && active === i
          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-1 py-2.5 transition-all duration-500 sm:py-3',
                done && 'border-violet-500/25 bg-violet-500/10',
                current &&
                  'border-violet-500/40 bg-violet-500/15 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)]',
                !done && !current && 'border-zinc-800/50 bg-zinc-950/40',
                failed && i <= active && 'border-red-900/40 bg-red-950/20',
              )}
            >
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-[10px] font-bold tabular-nums sm:size-8 sm:text-xs',
                  done && 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white',
                  current && 'animate-pulse bg-violet-500 text-white',
                  !done && !current && 'bg-zinc-800 text-zinc-600',
                )}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-center text-[9px] font-semibold leading-tight sm:text-[10px]',
                  current ? 'text-violet-200' : done ? 'text-zinc-400' : 'text-zinc-600',
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {detail ? (
        <p className="mt-4 text-sm text-zinc-400 animate-fade-in">{detail}</p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-300/90">
          {error}
        </p>
      ) : null}

      {loading && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800/80">
          <div
            className="h-full animate-progress-indeterminate rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600"
            style={{ width: '45%' }}
          />
        </div>
      )}
    </div>
  )
}
