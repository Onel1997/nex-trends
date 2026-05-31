import { Button } from '@/components/ui/Button'
import { SparklesIcon } from '@/components/ui/icons'
import { cn } from '@/lib'
import type { VideoFailureKind } from '@/lib/video-pipeline-messages'
import { getPremiumFailure } from '@/lib/video-pipeline-messages'

type VideoGenerationFallbackProps = {
  kind?: VideoFailureKind
  className?: string
  onRetry?: () => void
  onClose?: () => void
}

export function VideoGenerationFallback({
  kind = 'exhausted',
  className,
  onRetry,
  onClose,
}: VideoGenerationFallbackProps) {
  const copy = getPremiumFailure(kind)

  return (
    <div
      className={cn(
        'creator-fallback-card animate-fade-in relative overflow-hidden rounded-2xl border border-violet-500/20 p-6 sm:p-8',
        'bg-gradient-to-br from-zinc-950/95 via-violet-950/10 to-zinc-950/95',
        'shadow-[0_0_40px_-16px_rgba(139,92,246,0.35)]',
        className,
      )}
      role="alert"
    >
      <div className="creator-fallback-glow pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      <div className="relative flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10">
          <SparklesIcon className="size-7 text-violet-400/90" aria-hidden />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/70">
          Creator Pipeline
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
          {copy.title}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
          {copy.description}
        </p>

        <div className="mt-6 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
          {onRetry && kind === 'exhausted' ? (
            <Button variant="pro" size="md" className="flex-1" onClick={onRetry}>
              Erneut versuchen
            </Button>
          ) : null}
          {onClose ? (
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              Schließen
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
