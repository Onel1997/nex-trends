import { memo, useCallback } from 'react'
import { HookCard } from '@/components/hooks/HookCard'
import { Button } from '@/components/ui/Button'
import {
  coerceErrorMessage,
  formatHookDisplayText,
} from '@/lib/ai/parse-hooks-response'
import { cn } from '@/lib'

type HookResultItemProps = {
  hook: string
  index: number
  tone?: string | null
  platform?: string | null
  isSaved: boolean
  saving: boolean
  copied: boolean
  copyDisabled: boolean
  justSaved: boolean
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
  onCopy,
  onToggleSave,
}: HookResultItemProps) {
  const handleCopy = useCallback(() => onCopy(hook), [hook, onCopy])
  const handleToggleSave = useCallback(
    () => onToggleSave?.(hook),
    [hook, onToggleSave],
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
      animationDelayMs={0}
      onCopy={handleCopy}
      onToggleSave={onToggleSave ? handleToggleSave : undefined}
    />
  )
})

type HookResultsListProps = {
  hooks: string[]
  onCopy: (text: string) => void
  onToggleSave?: (text: string) => void
  savedHooks?: Set<string>
  isSaving?: string | null
  justSavedHook?: string | null
  tone?: string | null
  platform?: string | null
  copiedHook?: string | null
  dimmed?: boolean
  className?: string
}

export const HookResultsList = memo(function HookResultsList({
  hooks,
  onCopy,
  onToggleSave,
  savedHooks,
  isSaving,
  justSavedHook,
  tone,
  platform,
  copiedHook,
  dimmed = false,
  className,
}: HookResultsListProps) {
  if (hooks.length === 0) return null

  const displayHooks = hooks
    .map((hook) => formatHookDisplayText(hook))
    .filter((hook) => hook.length > 0)

  if (displayHooks.length === 0) return null

  return (
    <ol
      className={cn(
        'hook-results-feed w-full min-w-0 max-w-full',
        dimmed && 'pointer-events-none opacity-30 transition-opacity duration-500',
        className,
      )}
    >
      {displayHooks.map((hook, index) => (
        <li
          key={`${index}-${hook.slice(0, 32)}`}
          className="hook-results-feed__item hook-stagger-item min-w-0 max-w-full"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <HookResultItem
            hook={hook}
            index={index}
            tone={tone}
            platform={platform}
            isSaved={savedHooks?.has(hook) ?? false}
            saving={isSaving === hook}
            copied={copiedHook === hook}
            copyDisabled={copiedHook != null && copiedHook !== hook}
            justSaved={justSavedHook === hook}
            onCopy={onCopy}
            onToggleSave={onToggleSave}
          />
        </li>
      ))}
    </ol>
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
        : '10 virale Hooks werden erstellt …'

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

export function HookGeneratingSkeleton({ count = 10 }: { count?: number }) {
  const visible = Math.min(count, 6)

  return (
    <div className="hook-results-feed hook-results-feed--skeleton">
      {Array.from({ length: visible }).map((_, i) => (
        <div
          key={i}
          className="hook-skeleton-card animate-shimmer p-4 sm:p-5"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className="flex gap-3.5">
            <div className="size-10 shrink-0 rounded-xl bg-zinc-800/80 sm:size-9" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="h-4 w-full rounded-lg bg-zinc-800/70" />
              <div className="h-4 w-[88%] rounded-lg bg-zinc-800/50" />
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-14 rounded-md bg-zinc-800/40" />
                <div className="h-5 w-16 rounded-md bg-zinc-800/40" />
                <div className="h-5 w-12 rounded-md bg-zinc-800/30" />
              </div>
            </div>
            <div className="hidden shrink-0 flex-col gap-1.5 sm:flex">
              <div className="size-9 rounded-xl bg-zinc-800/50" />
              <div className="size-9 rounded-xl bg-zinc-800/50" />
            </div>
          </div>
        </div>
      ))}
      <p className="text-center text-xs font-medium text-violet-400/85 animate-pulse-soft">
        AI generiert Scroll-Stopper …
      </p>
    </div>
  )
}

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
          <p className="truncate text-sm font-medium text-zinc-100">{topic}</p>
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
