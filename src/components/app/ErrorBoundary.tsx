import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { VerifiedIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onReload={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}

type ErrorFallbackProps = {
  error?: Error | null
  title?: string
  message?: string
  onReset?: () => void
  onReload?: () => void
  className?: string
  compact?: boolean
}

export function ErrorFallback({
  error,
  title = 'Unerwarteter Fehler',
  message = 'NexTrends ist auf ein Problem gestoßen. Deine Daten sind sicher — lade die Seite neu oder versuche es erneut.',
  onReset,
  onReload,
  className,
  compact = false,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact
          ? 'rounded-2xl border border-red-500/20 bg-red-950/15 px-5 py-8'
          : 'min-h-svh ambient-glow bg-zinc-950 px-6 py-16',
        className,
      )}
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 shadow-[0_0_40px_-12px_rgba(239,68,68,0.45)]">
        <span className="text-xl font-bold text-red-300" aria-hidden>
          !
        </span>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{message}</p>

      {import.meta.env.DEV && error?.message && (
        <p className="mt-4 max-w-lg truncate rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-500">
          {error.message}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <Button variant="primary" onClick={onReset}>
            Erneut versuchen
          </Button>
        )}
        <Button variant="secondary" onClick={onReload ?? (() => window.location.reload())}>
          Seite neu laden
        </Button>
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-zinc-600">
        <VerifiedIcon className="size-3.5 text-emerald-500/70" aria-hidden />
        Verschlüsselte Verbindung · Daten bleiben geschützt
      </p>
    </div>
  )
}
