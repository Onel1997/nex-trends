import { memo, useCallback } from 'react'
import { SeoTitleCard } from '@/components/seo-title/SeoTitleCard'
import { Button } from '@/components/ui/Button'
import { useRotatingLabel } from '@/hooks/useRotatingLabel'
import { coerceErrorMessage } from '@/lib/ai/parse-seo-title-response'
import { getSeoTitleVariantKey } from '@/lib/seo-title-display'
import { cn } from '@/lib'
import type { SeoTitleVariant, SeoTitleVariantWithId } from '@/types/seo-title-generation'

const SEO_GEN_STEPS = [
  'Suchintention wird analysiert …',
  'High-CTR Keywords werden gefunden …',
  'SEO-Varianten werden generiert …',
  'Ranking-Potenzial wird optimiert …',
] as const

const SeoTitleResultItem = memo(function SeoTitleResultItem({
  variant,
  index,
  platform,
  isSaved,
  saving,
  copied,
  copyDisabled,
  justSaved,
  onCopy,
  onToggleSave,
}: {
  variant: SeoTitleVariantWithId
  index: number
  platform?: string | null
  isSaved: boolean
  saving: boolean
  copied: boolean
  copyDisabled: boolean
  justSaved: boolean
  onCopy: (variant: SeoTitleVariant) => void
  onToggleSave?: (variant: SeoTitleVariantWithId) => void
}) {
  const handleCopy = useCallback(() => onCopy(variant), [variant, onCopy])
  const handleToggleSave = useCallback(
    () => onToggleSave?.(variant),
    [variant, onToggleSave],
  )

  return (
    <SeoTitleCard
      variant={variant}
      index={index}
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

export const SeoTitleResultsList = memo(function SeoTitleResultsList({
  variants,
  onCopy,
  onToggleSave,
  savedIds,
  savingId,
  justSavedId,
  platform,
  copiedKey,
  dimmed = false,
  className,
}: {
  variants: SeoTitleVariantWithId[]
  onCopy: (variant: SeoTitleVariant) => void
  onToggleSave?: (variant: SeoTitleVariantWithId) => void
  savedIds?: Set<string>
  savingId?: string | null
  justSavedId?: string | null
  platform?: string | null
  copiedKey?: string | null
  dimmed?: boolean
  className?: string
}) {
  if (variants.length === 0) return null

  return (
    <ol
      className={cn(
        'seo-title-feed list-none p-0 m-0',
        dimmed && 'pointer-events-none opacity-30 transition-opacity duration-500',
        className,
      )}
    >
      {variants.map((variant, index) => {
        const key = getSeoTitleVariantKey(variant)
        return (
          <li
            key={variant.id}
            className="seo-title-stagger-item min-w-0 max-w-full"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <SeoTitleResultItem
              variant={variant}
              index={index}
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

export function SeoTitleErrorState({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-red-500/25 bg-red-500/5 p-4 text-sm text-red-300/90 sm:p-5',
        className,
      )}
    >
      <p className="leading-relaxed">{coerceErrorMessage(message)}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3 min-h-11 w-full sm:w-auto">
        Erneut versuchen
      </Button>
    </div>
  )
}

export function SeoTitlePanelError({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <SeoTitleErrorState
      message={message}
      onRetry={onRetry ?? (() => {})}
      className={cn(!onRetry && '[&_button]:hidden', className)}
    />
  )
}

export function SeoTitleGenerationProgress({
  isRegenerating = false,
  step,
  active = true,
}: {
  isRegenerating?: boolean
  step?: 'checking' | 'generating'
  active?: boolean
}) {
  const rotatingStep = useRotatingLabel(SEO_GEN_STEPS, active && step === 'generating')

  const label =
    step === 'checking'
      ? 'Credits werden geprüft …'
      : isRegenerating
        ? 'Neue SEO-Titel werden generiert …'
        : step === 'generating'
          ? rotatingStep
          : '5 SEO-Titel werden erstellt …'

  return (
    <div className="hook-gen-progress mb-4 overflow-hidden px-4 py-3.5" role="status" aria-live="polite">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="hook-gen-progress__bar w-full flex-1">
          <div className="absolute inset-y-0 w-2/5 animate-progress-indeterminate rounded-full bg-gradient-to-r from-violet-500/30 via-cyan-400 to-violet-400/90" />
        </div>
        <p key={label} className="seo-title-gen-step shrink-0 text-xs font-medium text-violet-200/95 sm:max-w-[52%] sm:text-right">
          {label}
        </p>
      </div>
    </div>
  )
}

const SeoTitleSkeletonCard = memo(function SeoTitleSkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="seo-title-skeleton-card seo-title-stagger-item animate-shimmer min-h-[10.5rem] px-4 py-4 sm:min-h-[11rem] sm:px-5 sm:py-5"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-8 shrink-0 rounded-full bg-zinc-800/70" />
        <div className="flex gap-1.5">
          <div className="size-10 rounded-xl bg-zinc-800/45" />
          <div className="size-10 rounded-xl bg-zinc-800/45" />
        </div>
      </div>
      <div className="mt-3 space-y-2.5">
        <div className="h-[1.125rem] w-full rounded-lg bg-zinc-800/70" />
        <div className="h-4 w-[88%] rounded-lg bg-zinc-800/50" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-14 rounded-md bg-zinc-800/40" />
          <div className="h-6 w-14 rounded-md bg-zinc-800/40" />
          <div className="h-6 w-14 rounded-md bg-zinc-800/35" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-16 rounded-md bg-zinc-800/35" />
          <div className="h-5 w-14 rounded-md bg-zinc-800/30" />
        </div>
      </div>
    </div>
  )
})

export function SeoTitleGeneratingSkeleton({ count = 5 }: { count?: number }) {
  const visible = Math.min(count, 5)
  return (
    <div className="seo-title-feed" aria-busy="true" aria-label="SEO-Titel werden generiert">
      {Array.from({ length: visible }).map((_, i) => (
        <SeoTitleSkeletonCard key={i} index={i} />
      ))}
      <p className="py-1 text-center text-xs font-medium text-cyan-400/80 animate-pulse-soft">
        AI optimiert für SERP …
      </p>
    </div>
  )
}

export function SeoTitleGenerationMeta({
  briefing,
  keyword,
  platform,
  createdAt,
  variantCount,
  generationIndex,
  className,
}: {
  briefing: string
  keyword?: string
  platform: string
  createdAt?: string | null
  variantCount: number
  generationIndex?: number
  className?: string
}) {
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
            <span className="text-[10px] font-bold tabular-nums uppercase tracking-widest text-cyan-400/80">
              #{generationIndex}
            </span>
          )}
          <p className="truncate text-sm font-medium text-zinc-200">{briefing}</p>
        </div>
        <p className="mt-1 text-[11px] text-zinc-600">
          {keyword ? `${keyword} · ` : ''}
          {platform} · {variantCount} Titel
        </p>
      </div>
      {createdAt && (
        <time dateTime={createdAt} className="shrink-0 text-[11px] tabular-nums text-zinc-600">
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
