import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { HookCard } from '@/components/hooks/HookCard'
import { Button } from '@/components/ui/Button'
import {
  coerceErrorMessage,
  getHookText,
} from '@/lib/ai/parse-hooks-response'
import { sortHooks } from '@/lib/hook-display'
import { cn } from '@/lib'
import type { HookSortMode, PremiumHook } from '@/types/ai-generation'

export const HOOK_RESULT_FIRST_ID = 'hook-result-first'

const SORT_OPTIONS: { value: HookSortMode; label: string }[] = [
  { value: 'retention', label: 'Highest Retention' },
  { value: 'framework', label: 'Framework' },
  { value: 'trigger', label: 'Trigger' },
]

type HookResultItemProps = {
  hook: PremiumHook
  index: number
  tone?: string | null
  platform?: string | null
  isSaved: boolean
  saving: boolean
  copied: boolean
  copyDisabled: boolean
  justSaved: boolean
  highlighted?: boolean
  whyExpanded: boolean
  onToggleWhy: () => void
  onCopy: (text: string) => void
  onToggleSave?: (text: string) => void
}

const HookResultItem = memo(function HookResultItem({
  hook,
  index,
  tone,
  platform,
  isSaved,
  saving,
  copied,
  copyDisabled,
  justSaved,
  highlighted = false,
  whyExpanded,
  onToggleWhy,
  onCopy,
  onToggleSave,
}: HookResultItemProps) {
  const hookText = getHookText(hook)

  const handleCopy = useCallback(() => onCopy(hookText), [hookText, onCopy])
  const handleToggleSave = useCallback(
    () => onToggleSave?.(hookText),
    [hookText, onToggleSave],
  )

  return (
    <HookCard
      hook={hook}
      index={index}
      tone={tone}
      platform={platform}
      saved={isSaved}
      saving={saving}
      copied={copied}
      copyDisabled={copyDisabled}
      justSaved={justSaved}
      highlighted={highlighted}
      whyExpanded={whyExpanded}
      onToggleWhy={onToggleWhy}
      animationDelayMs={0}
      onCopy={handleCopy}
      onToggleSave={onToggleSave ? handleToggleSave : undefined}
    />
  )
})

type HookResultsListProps = {
  hooks: PremiumHook[]
  onCopy: (text: string) => void
  onToggleSave?: (text: string) => void
  savedHooks?: Set<string>
  isHookSaved?: (text: string) => boolean
  isSaving?: string | null
  justSavedHook?: string | null
  tone?: string | null
  platform?: string | null
  copiedHook?: string | null
  dimmed?: boolean
  className?: string
  showSort?: boolean
  highlightFirstHook?: boolean
}

export const HookResultsList = memo(function HookResultsList({
  hooks,
  onCopy,
  onToggleSave,
  savedHooks,
  isHookSaved,
  isSaving,
  justSavedHook,
  tone,
  platform,
  copiedHook,
  dimmed = false,
  className,
  showSort = true,
  highlightFirstHook = false,
}: HookResultsListProps) {
  const [sortMode, setSortMode] = useState<HookSortMode>('retention')
  const [expandedWhyKey, setExpandedWhyKey] = useState<string | null>(null)

  const sortedHooks = useMemo(
    () => sortHooks(hooks, sortMode),
    [hooks, sortMode],
  )

  const getWhyKey = useCallback(
    (hook: PremiumHook, index: number) =>
      `${sortMode}-${index}-${getHookText(hook).slice(0, 32)}`,
    [sortMode],
  )

  const handleToggleWhy = useCallback((key: string) => {
    setExpandedWhyKey((current) => (current === key ? null : key))
  }, [])

  // Reset accordion when hooks list changes (new generation)
  const hooksFingerprint = hooks.map((h) => getHookText(h).slice(0, 24)).join('|')
  useEffect(() => {
    setExpandedWhyKey(null)
  }, [hooksFingerprint])

  if (hooks.length === 0) return null

  return (
    <div className={cn('w-full min-w-0 max-w-full', className)}>
      {showSort && hooks.length > 1 && (
        <div className="hook-results-sort mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Sortieren
          </span>
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortMode(value)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-smooth touch-manipulation',
                sortMode === value
                  ? 'border-violet-500/35 bg-violet-500/12 text-violet-200'
                  : 'border-zinc-800/80 bg-zinc-950/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
              )}
              aria-pressed={sortMode === value}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <ol
        className={cn(
          'hook-results-feed w-full min-w-0 max-w-full',
          dimmed && 'pointer-events-none opacity-30 transition-opacity duration-500',
        )}
      >
        {sortedHooks.map((hook, index) => {
          const hookText = getHookText(hook)
          const whyKey = getWhyKey(hook, index)
          return (
            <li
              key={`${sortMode}-${index}-${hookText.slice(0, 32)}`}
              id={index === 0 ? HOOK_RESULT_FIRST_ID : undefined}
              className="hook-results-feed__item hook-stagger-item min-w-0 max-w-full scroll-mt-24"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <HookResultItem
                hook={hook}
                index={index}
                tone={tone}
                platform={platform}
                isSaved={isHookSaved?.(hookText) ?? savedHooks?.has(hookText.trim()) ?? false}
                saving={isSaving === hookText}
                copied={copiedHook === hookText}
                copyDisabled={copiedHook != null && copiedHook !== hookText}
                justSaved={justSavedHook === hookText}
                highlighted={highlightFirstHook && index === 0}
                whyExpanded={expandedWhyKey === whyKey}
                onToggleWhy={() => handleToggleWhy(whyKey)}
                onCopy={onCopy}
                onToggleSave={onToggleSave}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
})

type HookErrorStateProps = {
  message: string
  onRetry: () => void
  retryLabel?: string
  className?: string
}

export function HookErrorState({
  message,
  onRetry,
  retryLabel = 'Erneut versuchen',
  className,
}: HookErrorStateProps) {
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

type HookPanelErrorProps = {
  message: string
  onRetry?: () => void
  className?: string
}

export function HookPanelError({ message, onRetry, className }: HookPanelErrorProps) {
  return (
    <HookErrorState
      message={message}
      onRetry={onRetry ?? (() => {})}
      retryLabel="Neu laden"
      className={cn(!onRetry && '[&_button]:hidden', className)}
    />
  )
}

export function HookGenerationProgress({
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
        ? 'Neue Hooks werden generiert …'
        : '10 Premium-Hooks werden erstellt …'

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

export { HookGeneratingSkeleton } from '@/components/ui/loading-states'

type HookGenerationMetaProps = {
  topic: string
  tone: string
  platform: string
  createdAt?: string | null
  hookCount: number
  generationIndex?: number
  className?: string
}

export function HookGenerationMeta({
  topic,
  tone,
  platform,
  createdAt,
  hookCount,
  generationIndex,
  className,
}: HookGenerationMetaProps) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {generationIndex != null && (
            <span className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-violet-300 ring-1 ring-violet-500/20">
              #{generationIndex}
            </span>
          )}
          <p className="line-clamp-2 break-words text-sm font-medium leading-snug text-zinc-100">
            {topic}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {tone} · {platform} · {hookCount} Hooks
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
    </div>
  )
}
