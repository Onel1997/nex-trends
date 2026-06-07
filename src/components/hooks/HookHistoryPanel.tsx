import { memo, useCallback, useState, type ReactNode, type SVGProps } from 'react'
import { HookCard } from '@/components/hooks/HookCard'
import { HookPanelError } from '@/components/hooks/HookResultsList'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { HookResultSkeleton } from '@/components/ui/loading-states'
import {
  HookHistoryEmptyState,
  HookSavedEmptyState,
} from '@/components/hooks/HookEmptyStates'
import {
  ArrowPathIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import { formatHookDisplayText } from '@/lib/ai/parse-hooks-response'
import { formatHookDate, getPlatformLabel, getToneLabel } from '@/lib/hook-display'
import { groupHistoryByDate } from '@/lib/hook-history-utils'
import { cn } from '@/lib'
import type { GeneratedHooksRow, SavedHookRow } from '@/types/ai-generation'

type HookHistoryItemProps = {
  row: GeneratedHooksRow
  index: number
  isActive: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onSelect: () => void
  onRegenerate: () => void
}

const HookHistoryItem = memo(function HookHistoryItem({
  row,
  index,
  isActive,
  isExpanded,
  onToggleExpand,
  onSelect,
  onRegenerate,
}: HookHistoryItemProps) {
  const hookCount = row.generated_hooks_json?.length ?? 0
  const toneLabel = getToneLabel(row.tone)
  const platformLabel = getPlatformLabel(row.platform)
  const previewHooks = (row.generated_hooks_json ?? []).slice(0, 2)

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
          <p className="truncate text-sm font-medium text-zinc-100">{row.topic}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="hook-badge hook-badge--tone">{toneLabel}</span>
            <span className="hook-badge hook-badge--platform">{platformLabel}</span>
            <span className="text-[10px] font-medium tabular-nums text-zinc-600">
              {hookCount} Hooks
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <time
            dateTime={row.created_at}
            className="text-[10px] tabular-nums text-zinc-600"
            title={formatHookDate(row.created_at, 'long')}
          >
            {formatHookDate(row.created_at, 'short')}
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
            {previewHooks.map((hook, i) => (
              <p
                key={i}
                className="line-clamp-2 text-xs leading-relaxed text-zinc-400"
              >
                {i + 1}. {formatHookDisplayText(hook)}
              </p>
            ))}
            {hookCount > 2 && (
              <p className="text-[10px] text-zinc-600">+{hookCount - 2} weitere Hooks</p>
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

type HookHistoryPanelProps = {
  history: GeneratedHooksRow[]
  isLoading: boolean
  error?: string | null
  activeId?: string | null
  onSelect: (row: GeneratedHooksRow) => void
  onRegenerate: (row: GeneratedHooksRow) => void
  onRefresh?: () => void
  className?: string
}

export function HookHistoryPanel({
  history,
  isLoading,
  error,
  activeId,
  onSelect,
  onRegenerate,
  onRefresh,
  className,
}: HookHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className={cn('hook-history-panel space-y-3', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <HookPanelError message={error} onRetry={onRefresh} className={className} />
  }

  if (history.length === 0) {
    return <HookHistoryEmptyState className={className} />
  }

  const groups = groupHistoryByDate(history)
  let counter = history.length

  return (
    <div className={cn('hook-history-panel', className)}>
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
              {items.map((row) => {
                const index = counter--
                return (
                  <HookHistoryItem
                    key={row.id}
                    row={row}
                    index={index}
                    isActive={activeId === row.id}
                    isExpanded={expandedId === row.id}
                    onToggleExpand={() =>
                      setExpandedId((id) => (id === row.id ? null : row.id))
                    }
                    onSelect={() => onSelect(row)}
                    onRegenerate={() => onRegenerate(row)}
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

type HookSavedPanelProps = {
  hooks: SavedHookRow[]
  isLoading: boolean
  error?: string | null
  onCopy: (text: string) => void
  onRemove: (id: string) => void
  onRegenerate?: (hook: SavedHookRow) => void
  onRefresh?: () => void
  copiedHook?: string | null
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  className?: string
}

const SavedHookItem = memo(function SavedHookItem({
  hook,
  index,
  copied,
  copyDisabled,
  removing,
  onCopy,
  onRemove,
  onRegenerate,
}: {
  hook: SavedHookRow
  index: number
  copied: boolean
  copyDisabled: boolean
  removing: boolean
  onCopy: () => void
  onRemove: () => void
  onRegenerate?: () => void
}) {
  return (
    <HookCard
      hook={hook.hook_text}
      tone={hook.tone}
      platform={hook.platform}
      variant="saved"
      showIndex={false}
      savedAt={hook.saved_at}
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

export function HookSavedPanel({
  hooks,
  isLoading,
  error,
  onCopy,
  onRemove,
  onRegenerate,
  onRefresh,
  copiedHook,
  emptyTitle,
  emptyDescription,
  emptyAction,
  className,
}: HookSavedPanelProps) {
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
      <div
        className={cn('hook-saved-feed hook-saved-feed--skeleton space-y-3.5', className)}
        aria-busy="true"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <HookResultSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return <HookPanelError message={error} onRetry={onRefresh} className={className} />
  }

  if (hooks.length === 0) {
    return (
      <HookSavedEmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return (
    <ul className={cn('hook-saved-feed w-full min-w-0', className)}>
      {hooks.map((hook, index) => (
        <li
          key={hook.id}
          className="hook-saved-feed__item hook-stagger-item min-w-0"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <SavedHookItem
            hook={hook}
            index={index}
            copied={copiedHook === hook.hook_text}
            copyDisabled={copiedHook != null && copiedHook !== hook.hook_text}
            removing={removingIds.has(hook.id)}
            onCopy={() => onCopy(hook.hook_text)}
            onRemove={() => void handleRemove(hook.id)}
            onRegenerate={onRegenerate ? () => onRegenerate(hook) : undefined}
          />
        </li>
      ))}
    </ul>
  )
}

export function HookTabRefreshButton({
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
