import { cn } from '@/lib'
import type { VideoJobStatus } from '@/lib/video-generation-pipeline'

type VideoBlueprintLoadingProps = {
  message: string
  phase?: 'crafting' | 'rendering' | 'retrying'
  status?: VideoJobStatus
  retryAttempt?: number
  className?: string
}

export function VideoBlueprintLoading({
  message,
  phase = 'crafting',
  status,
  retryAttempt = 0,
  className,
}: VideoBlueprintLoadingProps) {
  const retrying = phase === 'retrying'
  const rendering =
    phase === 'rendering' ||
    (!retrying && (status === 'generating' || status === 'processing'))

  const headline = retrying
    ? 'Verbindung wird wiederhergestellt…'
    : rendering
      ? 'Generiere Creator Blueprint…'
      : 'Blueprint wird vorbereitet'

  const subline = retrying
    ? `Automatischer Versuch ${retryAttempt} · OpenAI Strategist`
    : rendering
      ? 'Strategist ✓ · Creative Director ✓ · Viral Editor aktiv'
      : 'AI Strategist · Creative Director · Viral Editor'

  const progressIndex = retrying ? 2 : rendering ? 3 : 1

  return (
    <div
      className={cn(
        'creator-blueprint-loading relative overflow-hidden rounded-2xl border border-violet-500/25 p-6 sm:p-8',
        retrying && 'creator-blueprint-loading--retry',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="creator-loading-gradient pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="creator-loading-grid pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />

      <div className="relative flex flex-col items-center text-center">
        <div className={cn('creator-orb-wrap mb-6', retrying && 'creator-orb-wrap--retry')}>
          <div className="creator-orb" aria-hidden />
          <div className="creator-orb-ring creator-orb-ring--1" aria-hidden />
          <div className="creator-orb-ring creator-orb-ring--2" aria-hidden />
          <div className="creator-orb-core" aria-hidden />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400/80">
          Creator OS
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
          {headline}
        </h3>

        <p
          key={`${message}-${retryAttempt}`}
          className="creator-loading-message mt-3 max-w-sm text-sm leading-relaxed text-violet-200/90"
        >
          {message}
        </p>

        <div className="mt-6 flex w-full max-w-xs gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-700',
                i <= progressIndex
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                  : 'bg-zinc-800/80',
                retrying && i <= progressIndex && 'animate-pulse',
              )}
            />
          ))}
        </div>

        <p className="mt-4 text-[11px] text-zinc-600">{subline}</p>
      </div>
    </div>
  )
}
