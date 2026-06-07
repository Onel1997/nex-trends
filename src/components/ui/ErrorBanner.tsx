import { Button } from '@/components/ui/Button'
import { normalizeError } from '@/lib/errors'
import { cn } from '@/lib'

type ErrorBannerProps = {
  error: unknown
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  compact?: boolean
}

export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
  className,
  compact = false,
}: ErrorBannerProps) {
  const normalized = normalizeError(error)

  return (
    <div
      role="alert"
      className={cn(
        'nex-error-banner animate-fade-in flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-950/20 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn('font-semibold text-red-200', compact ? 'text-xs' : 'text-sm')}>
          {normalized.title}
        </p>
        <p className={cn('mt-0.5 text-red-300/80', compact ? 'text-[11px]' : 'text-xs')}>
          {normalized.message}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {normalized.retryable && onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="btn-press">
            Erneut versuchen
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-2 py-1 text-xs text-red-300/70 transition-smooth hover:bg-red-500/10 hover:text-red-200"
            aria-label="Schließen"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
