import { memo, useCallback } from 'react'
import { AdCopyCard } from '@/components/ad-copy/AdCopyCard'
import { Button } from '@/components/ui/Button'
import { coerceErrorMessage } from '@/lib/ai/parse-ad-copy-response'
import { getAdCopyVariantKey } from '@/lib/ad-copy-display'
import { cn } from '@/lib'
import type { AdCopyVariant, AdCopyVariantWithId } from '@/types/ad-copy-generation'

type AdCopyResultItemProps = {
  variant: AdCopyVariantWithId
  index: number
  tone?: string | null
  platform?: string | null
  isSaved: boolean
  saving: boolean
  copied: boolean
  copyDisabled: boolean
  justSaved: boolean
  onCopy: (variant: AdCopyVariant) => void
  onToggleSave?: (variant: AdCopyVariantWithId) => void
}

const AdCopyResultItem = memo(function AdCopyResultItem({
  variant,
  index,
  tone,
  platform,
  isSaved,
  saving,
  copied,
  copyDisabled,
  justSaved,
  onCopy,
  onToggleSave,
}: AdCopyResultItemProps) {
  const handleCopy = useCallback(() => onCopy(variant), [variant, onCopy])
  const handleToggleSave = useCallback(
    () => onToggleSave?.(variant),
    [variant, onToggleSave],
  )

  return (
    <AdCopyCard
      variant={variant}
      index={index}
      tone={tone}
      platform={platform}
      saved={isSaved}
      saving={saving}
      copied={copied}
      copyDisabled={copyDisabled}
      justSaved={justSaved}
      onCopy={handleCopy}
      onToggleSave={onToggleSave ? handleToggleSave : undefined}
    />
  )
})

type AdCopyResultsListProps = {
  variants: AdCopyVariantWithId[]
  onCopy: (variant: AdCopyVariant) => void
  onToggleSave?: (variant: AdCopyVariantWithId) => void
  savedIds?: Set<string>
  savingId?: string | null
  justSavedId?: string | null
  tone?: string | null
  platform?: string | null
  copiedKey?: string | null
  dimmed?: boolean
  className?: string
}

export const AdCopyResultsList = memo(function AdCopyResultsList({
  variants,
  onCopy,
  onToggleSave,
  savedIds,
  savingId,
  justSavedId,
  tone,
  platform,
  copiedKey,
  dimmed = false,
  className,
}: AdCopyResultsListProps) {
  if (variants.length === 0) return null

  return (
    <ol
      className={cn(
        'ad-copy-feed list-none p-0 m-0',
        dimmed && 'pointer-events-none opacity-30 transition-opacity duration-500',
        className,
      )}
    >
      {variants.map((variant, index) => {
        const key = getAdCopyVariantKey(variant)
        return (
          <li
            key={variant.id}
            className="ad-copy-stagger-item min-w-0 max-w-full"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <AdCopyResultItem
              variant={variant}
              index={index}
              tone={tone}
              platform={platform}
              isSaved={variant.is_saved || (savedIds?.has(variant.id) ?? false)}
              saving={savingId === variant.id}
              copied={copiedKey === key}
              copyDisabled={copiedKey != null && copiedKey !== key}
              justSaved={justSavedId === variant.id}
              onCopy={onCopy}
              onToggleSave={onToggleSave}
            />
          </li>
        )
      })}
    </ol>
  )
})

type AdCopyErrorStateProps = {
  message: string
  onRetry: () => void
  retryLabel?: string
  className?: string
}

export function AdCopyErrorState({
  message,
  onRetry,
  retryLabel = 'Erneut versuchen',
  className,
}: AdCopyErrorStateProps) {
  const displayMessage = coerceErrorMessage(message)

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-red-500/25 bg-red-500/5 p-4 sm:p-5 text-sm text-red-300/90',
        className,
      )}
    >
      <p className="leading-relaxed">{displayMessage}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3 min-h-11 w-full sm:w-auto">
        {retryLabel}
      </Button>
    </div>
  )
}

export function AdCopyPanelError({ message, onRetry, className }: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <AdCopyErrorState
      message={message}
      onRetry={onRetry ?? (() => {})}
      retryLabel="Neu laden"
      className={cn(!onRetry && '[&_button]:hidden', className)}
    />
  )
}

export function AdCopyGenerationProgress({
  isRegenerating = false,
  step,
}: {
  isRegenerating?: boolean
  step?: 'checking' | 'generating'
}) {
  const label =
    step === 'checking'
      ? 'Credits werden geprüft …'
      : isRegenerating
        ? 'Neue Ad Copy wird generiert …'
        : '5 Ad Copy Varianten werden erstellt …'

  return (
    <div
      className="hook-gen-progress mb-4 overflow-hidden px-4 py-3.5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="hook-gen-progress__bar flex-1">
          <div className="absolute inset-y-0 w-2/5 animate-progress-indeterminate rounded-full bg-gradient-to-r from-violet-500/30 via-violet-400 to-fuchsia-400/90" />
        </div>
        <p className="shrink-0 text-xs font-medium text-violet-200/95">{label}</p>
      </div>
    </div>
  )
}

export function AdCopyGeneratingSkeleton({ count = 5 }: { count?: number }) {
  const visible = Math.min(count, 5)

  return (
    <div className="ad-copy-feed">
      {Array.from({ length: visible }).map((_, i) => (
        <div
          key={i}
          className="ad-copy-skeleton-card ad-copy-stagger-item animate-shimmer px-4 py-4 sm:px-5 sm:py-5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="size-8 shrink-0 rounded-full bg-zinc-800/70" />
            <div className="flex gap-1.5">
              <div className="size-10 rounded-xl bg-zinc-800/45" />
              <div className="size-10 rounded-xl bg-zinc-800/45" />
            </div>
          </div>
          <div className="mt-3 space-y-2.5">
            <div className="h-4 w-full rounded-lg bg-zinc-800/65" />
            <div className="h-4 w-[94%] rounded-lg bg-zinc-800/50" />
            <div className="h-4 w-[72%] rounded-lg bg-zinc-800/40" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-14 rounded-md bg-zinc-800/35" />
              <div className="h-5 w-16 rounded-md bg-zinc-800/35" />
              <div className="h-5 w-12 rounded-md bg-zinc-800/30" />
            </div>
          </div>
        </div>
      ))}
      <p className="py-1 text-center text-xs font-medium text-violet-400/80 animate-pulse-soft">
        AI generiert Ad Copy …
      </p>
    </div>
  )
}

type AdCopyGenerationMetaProps = {
  briefing: string
  tone: string
  platform: string
  createdAt?: string | null
  variantCount: number
  generationIndex?: number
  className?: string
}

export function AdCopyGenerationMeta({
  briefing,
  tone,
  platform,
  createdAt,
  variantCount,
  generationIndex,
  className,
}: AdCopyGenerationMetaProps) {
  return (
    <header
      className={cn(
        'mb-4 flex flex-col gap-1.5 px-0.5 sm:mb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {generationIndex != null && (
            <span className="text-[10px] font-bold tabular-nums uppercase tracking-widest text-violet-400/80">
              #{generationIndex}
            </span>
          )}
          <p className="truncate text-sm font-medium text-zinc-200">{briefing}</p>
        </div>
        <p className="mt-1 text-[11px] text-zinc-600">
          {tone} · {platform} · {variantCount} Varianten
        </p>
      </div>
      {createdAt && (
        <time
          dateTime={createdAt}
          className="shrink-0 text-[11px] tabular-nums text-zinc-600"
        >
          {new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(createdAt))}
        </time>
      )}
    </header>
  )
}
