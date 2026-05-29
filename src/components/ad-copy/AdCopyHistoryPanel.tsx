import { memo, useCallback, useState, type ReactNode, type SVGProps } from 'react'
import { AdCopyCard } from '@/components/ad-copy/AdCopyCard'
import { AdCopyPanelError } from '@/components/ad-copy/AdCopyResultsList'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  AdCopyHistoryEmptyState,
  AdCopySavedEmptyState,
} from '@/components/ad-copy/AdCopyEmptyStates'
import {
  ArrowPathIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import {
  formatAdCopyDate,
  getAdCopyPlatformLabel,
  getAdCopyToneLabel,
  getAdCopyVariantKey,
  savedRowToVariant,
} from '@/lib/ad-copy-display'
import { groupAdCopyHistoryByDate } from '@/lib/ad-copy-history-utils'
import { cn } from '@/lib'
import type {
  AdCopyGenerationBatch,
  AdCopyVariant,
  SavedAdCopyRow,
} from '@/types/ad-copy-generation'

type AdCopyHistoryItemProps = {
  batch: AdCopyGenerationBatch
  index: number
  isActive: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onSelect: () => void
  onRegenerate: () => void
}

const AdCopyHistoryItem = memo(function AdCopyHistoryItem({
  batch,
  index,
  isActive,
  isExpanded,
  onToggleExpand,
  onSelect,
  onRegenerate,
}: AdCopyHistoryItemProps) {
  const variantCount = batch.variants.length
  const toneLabel = getAdCopyToneLabel(batch.tone)
  const platformLabel = getAdCopyPlatformLabel(batch.platform)
  const previewVariants = batch.variants.slice(0, 2)

  return (
    <li className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950/40 transition-smooth hover:border-zinc-700/80">
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          'flex w-full min-h-[4.5rem] items-start gap-3 px-4 py-3.5 text-left touch-manipulation transition-smooth',
          isActive && 'bg-violet-500/[0.07]',
        )}
        aria-expanded={isExpanded}
      >
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-[10px] font-bold tabular-nums text-zinc-400">
          {index}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">{batch.briefing}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="hook-badge hook-badge--tone">{toneLabel}</span>
            <span className="hook-badge hook-badge--platform">{platformLabel}</span>
            <span className="text-[10px] font-medium tabular-nums text-zinc-600">
              {variantCount} Varianten
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <time
            dateTime={batch.created_at}
            className="text-[10px] tabular-nums text-zinc-600"
            title={formatAdCopyDate(batch.created_at, 'long')}
          >
            {formatAdCopyDate(batch.created_at, 'short')}
          </time>
          <ChevronDownIcon
            className={cn(
              'size-4 text-zinc-600 transition-transform duration-300',
              isExpanded && 'rotate-180',
            )}
            aria-hidden
          />
        </div>
      </button>

      <div
        className={cn(
          'hook-history-expand grid transition-all duration-300 ease-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-zinc-800/60 px-4 py-3.5">
            {previewVariants.map((variant) => (
              <div key={variant.id} className="space-y-1">
                <p className="line-clamp-1 text-xs font-semibold text-zinc-300">
                  {variant.headline}
                </p>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
                  {variant.primaryText}
                </p>
                <p className="text-[10px] font-medium text-violet-400/80">CTA: {variant.cta}</p>
              </div>
            ))}
            {variantCount > 2 && (
              <p className="text-[10px] text-zinc-600">+{variantCount - 2} weitere Varianten</p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={onSelect}
                className="min-h-11 sm:flex-1"
              >
                <SparklesIcon className="size-3.5" aria-hidden />
                Laden
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={onRegenerate}
                className="min-h-11 sm:flex-1"
              >
                <ArrowPathIcon className="size-3.5" aria-hidden />
                Neu generieren
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
})

type AdCopyHistoryPanelProps = {
  history: AdCopyGenerationBatch[]
  isLoading: boolean
  error?: string | null
  activeId?: string | null
  onSelect: (batch: AdCopyGenerationBatch) => void
  onRegenerate: (batch: AdCopyGenerationBatch) => void
  onRefresh?: () => void
  className?: string
}

export function AdCopyHistoryPanel({
  history,
  isLoading,
  error,
  activeId,
  onSelect,
  onRegenerate,
  onRefresh,
  className,
}: AdCopyHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className={cn('space-y-3 overflow-x-hidden', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <AdCopyPanelError message={error} onRetry={onRefresh} className={className} />
  }

  if (history.length === 0) {
    return <AdCopyHistoryEmptyState className={className} />
  }

  const groups = groupAdCopyHistoryByDate(history)
  let counter = history.length

  return (
    <div className={cn('overflow-x-hidden', className)}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
        {history.length} Generierung{history.length === 1 ? '' : 'en'}
      </p>

      <div className="space-y-5">
        {groups.map(({ group, label, items }) => (
          <section key={group}>
            <h3 className="mb-2 px-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {label}
            </h3>
            <ul className="space-y-2">
              {items.map((batch) => {
                const index = counter--
                return (
                  <AdCopyHistoryItem
                    key={batch.id}
                    batch={batch}
                    index={index}
                    isActive={activeId === batch.id}
                    isExpanded={expandedId === batch.id}
                    onToggleExpand={() =>
                      setExpandedId((id) => (id === batch.id ? null : batch.id))
                    }
                    onSelect={() => onSelect(batch)}
                    onRegenerate={() => onRegenerate(batch)}
                  />
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

type AdCopySavedPanelProps = {
  ads: SavedAdCopyRow[]
  isLoading: boolean
  error?: string | null
  onCopy: (variant: AdCopyVariant) => void
  onRemove: (id: string) => void
  onRegenerate?: (ad: SavedAdCopyRow) => void
  onRefresh?: () => void
  copiedKey?: string | null
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  className?: string
}

const SavedAdItem = memo(function SavedAdItem({
  ad,
  index,
  copied,
  copyDisabled,
  removing,
  onCopy,
  onRemove,
  onRegenerate,
}: {
  ad: SavedAdCopyRow
  index: number
  copied: boolean
  copyDisabled: boolean
  removing: boolean
  onCopy: () => void
  onRemove: () => void
  onRegenerate?: () => void
}) {
  const variant = savedRowToVariant(ad)

  return (
    <AdCopyCard
      variant={variant}
      tone={ad.tone}
      platform={ad.platform}
      variantType="saved"
      showIndex={false}
      savedAt={ad.created_at}
      copied={copied}
      copyDisabled={copyDisabled}
      removing={removing}
      animationDelayMs={index * 40}
      onCopy={onCopy}
      onRemove={onRemove}
      onRegenerate={onRegenerate}
    />
  )
})

const REMOVE_ANIM_MS = 240

export function AdCopySavedPanel({
  ads,
  isLoading,
  error,
  onCopy,
  onRemove,
  onRegenerate,
  onRefresh,
  copiedKey,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
}: AdCopySavedPanelProps) {
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set())

  const handleRemove = useCallback(
    async (id: string) => {
      let shouldRun = false
      setRemovingIds((prev) => {
        if (prev.has(id)) return prev
        shouldRun = true
        return new Set(prev).add(id)
      })
      if (!shouldRun) return

      await new Promise((resolve) => window.setTimeout(resolve, REMOVE_ANIM_MS))
      try {
        await onRemove(id)
      } finally {
        setRemovingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [onRemove],
  )

  if (isLoading) {
    return (
      <div className={cn('ad-copy-feed', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="ad-copy-skeleton-card ad-copy-stagger-item animate-shimmer h-36 w-full"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return <AdCopyPanelError message={error} onRetry={onRefresh} className={className} />
  }

  if (ads.length === 0) {
    return (
      <AdCopySavedEmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return (
    <ul className={cn('ad-copy-feed list-none p-0 m-0', className)}>
      {ads.map((ad, index) => {
        const variant = savedRowToVariant(ad)
        const key = getAdCopyVariantKey(variant)
        return (
          <li
            key={ad.id}
            className="ad-copy-stagger-item min-w-0"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <SavedAdItem
              ad={ad}
              index={index}
              copied={copiedKey === key}
              copyDisabled={copiedKey != null && copiedKey !== key}
              removing={removingIds.has(ad.id)}
              onCopy={() => onCopy(variant)}
              onRemove={() => void handleRemove(ad.id)}
              onRegenerate={onRegenerate ? () => onRegenerate(ad) : undefined}
            />
          </li>
        )
      })}
    </ul>
  )
}

export function AdCopyTabRefreshButton({
  onRefresh,
  loading,
  className,
}: {
  onRefresh: () => void
  loading?: boolean
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={onRefresh}
      className={cn('min-h-10', className)}
    >
      <ArrowPathIcon className="size-3.5" aria-hidden />
      Aktualisieren
    </Button>
  )
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
