import { memo, useCallback, useState, type ReactNode, type SVGProps } from 'react'
import { SeoTitleCard } from '@/components/seo-title/SeoTitleCard'
import { SeoTitlePanelError } from '@/components/seo-title/SeoTitleResultsList'
import {
  SeoTitleHistoryEmptyState,
  SeoTitleSavedEmptyState,
} from '@/components/seo-title/SeoTitleEmptyStates'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ArrowPathIcon, MagnifyingGlassIcon } from '@/components/ui/icons'
import {
  formatSeoTitleDate,
  getSeoIntentLabel,
  getSeoPlatformLabel,
  getSeoTitleVariantKey,
  savedRowToVariant,
} from '@/lib/seo-title-display'
import { groupSeoTitleHistoryByDate } from '@/lib/seo-title-history-utils'
import { cn } from '@/lib'
import type {
  SavedSeoTitleRow,
  SeoTitleGenerationBatch,
  SeoTitleVariant,
} from '@/types/seo-title-generation'

const SeoTitleHistoryItem = memo(function SeoTitleHistoryItem({
  batch,
  index,
  isActive,
  isExpanded,
  onToggleExpand,
  onSelect,
  onRegenerate,
}: {
  batch: SeoTitleGenerationBatch
  index: number
  isActive: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onSelect: () => void
  onRegenerate: () => void
}) {
  const preview = batch.variants.slice(0, 2)
  return (
    <li className="overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950/40 transition-smooth hover:border-zinc-700/80">
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          'flex w-full min-h-[4.5rem] items-start gap-3 px-4 py-3.5 text-left touch-manipulation',
          isActive && 'bg-cyan-500/[0.07]',
        )}
        aria-expanded={isExpanded}
      >
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-[10px] font-bold tabular-nums text-zinc-400">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">{batch.briefing}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="hook-badge hook-badge--tone">{batch.keyword || 'SEO'}</span>
            <span className="hook-badge hook-badge--platform">
              {getSeoPlatformLabel(batch.platform)}
            </span>
            <span className="text-[10px] text-zinc-600">{batch.variants.length} Titel</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <time dateTime={batch.created_at} className="text-[10px] tabular-nums text-zinc-600">
            {formatSeoTitleDate(batch.created_at, 'short')}
          </time>
          <ChevronDown className={cn('size-4 text-zinc-600 transition-transform', isExpanded && 'rotate-180')} />
        </div>
      </button>
      <div
        className={cn(
          'hook-history-expand grid transition-all duration-300',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-zinc-800/60 px-4 py-3.5">
            {preview.map((v) => (
              <div key={v.id} className="space-y-0.5">
                <p className="line-clamp-2 text-xs font-semibold text-zinc-300">{v.title}</p>
                <p className="text-[10px] text-zinc-500">
                  SEO {v.seoScore} · CTR {v.ctrScore} · {getSeoIntentLabel(v.searchIntent)}
                </p>
              </div>
            ))}
            {batch.variants.length > 2 && (
              <p className="text-[10px] text-zinc-600">+{batch.variants.length - 2} weitere</p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" size="sm" fullWidth onClick={onSelect} className="min-h-11 sm:flex-1">
                <MagnifyingGlassIcon className="size-3.5" aria-hidden />
                Laden
              </Button>
              <Button variant="ghost" size="sm" fullWidth onClick={onRegenerate} className="min-h-11 sm:flex-1">
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

export function SeoTitleHistoryPanel({
  history,
  isLoading,
  error,
  activeId,
  onSelect,
  onRegenerate,
  onRefresh,
  emptyAction,
  emptyHint,
  className,
}: {
  history: SeoTitleGenerationBatch[]
  isLoading: boolean
  error?: string | null
  activeId?: string | null
  onSelect: (batch: SeoTitleGenerationBatch) => void
  onRegenerate: (batch: SeoTitleGenerationBatch) => void
  onRefresh?: () => void
  emptyAction?: ReactNode
  emptyHint?: string
  className?: string
}) {
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
  if (error) return <SeoTitlePanelError message={error} onRetry={onRefresh} className={className} />
  if (history.length === 0) {
    return <SeoTitleHistoryEmptyState action={emptyAction} hint={emptyHint} className={className} />
  }

  const groups = groupSeoTitleHistoryByDate(history)
  let counter = history.length

  return (
    <div className={cn('overflow-x-hidden', className)}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
        {history.length} Generierung{history.length === 1 ? '' : 'en'}
      </p>
      <div className="space-y-5">
        {groups.map(({ group, label, items }) => (
          <section key={group}>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</h3>
            <ul className="space-y-2">
              {items.map((batch) => {
                const index = counter--
                return (
                  <SeoTitleHistoryItem
                    key={batch.id}
                    batch={batch}
                    index={index}
                    isActive={activeId === batch.id}
                    isExpanded={expandedId === batch.id}
                    onToggleExpand={() => setExpandedId((id) => (id === batch.id ? null : batch.id))}
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

const SavedSeoItem = memo(function SavedSeoItem({
  ad,
  index,
  copied,
  copyDisabled,
  removing,
  onCopy,
  onRemove,
}: {
  ad: SavedSeoTitleRow
  index: number
  copied: boolean
  copyDisabled: boolean
  removing: boolean
  onCopy: () => void
  onRemove: () => void
}) {
  const variant = savedRowToVariant(ad)
  return (
    <SeoTitleCard
      variant={variant}
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
    />
  )
})

const REMOVE_ANIM_MS = 240

export function SeoTitleSavedPanel({
  titles,
  isLoading,
  error,
  onCopy,
  onRemove,
  onRefresh,
  copiedKey,
  emptyAction,
  emptyHint,
  className,
}: {
  titles: SavedSeoTitleRow[]
  isLoading: boolean
  error?: string | null
  onCopy: (variant: SeoTitleVariant) => void
  onRemove: (id: string) => void
  onRefresh?: () => void
  copiedKey?: string | null
  emptyAction?: ReactNode
  emptyHint?: string
  className?: string
}) {
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
      await new Promise((r) => window.setTimeout(r, REMOVE_ANIM_MS))
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
      <div className={cn('seo-title-feed', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="seo-title-skeleton-card seo-title-stagger-item animate-shimmer h-36"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    )
  }
  if (error) return <SeoTitlePanelError message={error} onRetry={onRefresh} className={className} />
  if (titles.length === 0) {
    return <SeoTitleSavedEmptyState action={emptyAction} hint={emptyHint} className={className} />
  }

  return (
    <ul className={cn('seo-title-feed list-none p-0 m-0', className)}>
      {titles.map((ad, index) => {
        const variant = savedRowToVariant(ad)
        const key = getSeoTitleVariantKey(variant)
        return (
          <li key={ad.id} className="seo-title-stagger-item min-w-0" style={{ animationDelay: `${index * 40}ms` }}>
            <SavedSeoItem
              ad={ad}
              index={index}
              copied={copiedKey === key}
              copyDisabled={copiedKey != null && copiedKey !== key}
              removing={removingIds.has(ad.id)}
              onCopy={() => onCopy(variant)}
              onRemove={() => void handleRemove(ad.id)}
            />
          </li>
        )
      })}
    </ul>
  )
}

export function SeoTitleTabRefreshButton({
  onRefresh,
  loading,
  className,
}: {
  onRefresh: () => void
  loading?: boolean
  className?: string
}) {
  return (
    <Button variant="ghost" size="sm" loading={loading} onClick={onRefresh} className={cn('min-h-10', className)}>
      <ArrowPathIcon className="size-3.5" aria-hidden />
      Aktualisieren
    </Button>
  )
}

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
