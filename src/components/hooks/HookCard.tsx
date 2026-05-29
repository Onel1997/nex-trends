import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import {
  ArrowPathIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  CheckIcon,
  CopyIcon,
  TrashIcon,
} from '@/components/ui/icons'
import {
  formatHookDate,
  getHookCharCountClass,
  getHookCharState,
  getPlatformLabel,
  getToneLabel,
  HOOK_CHAR_LIMIT,
} from '@/lib/hook-display'
import { cn } from '@/lib'

export type HookCardProps = {
  hook: string
  index?: number
  tone?: string | null
  platform?: string | null
  saved?: boolean
  saving?: boolean
  copied?: boolean
  copyDisabled?: boolean
  justSaved?: boolean
  onCopy?: () => void
  onToggleSave?: () => void
  onRemove?: () => void
  onRegenerate?: () => void
  showIndex?: boolean
  variant?: 'result' | 'saved'
  savedAt?: string | null
  className?: string
  animationDelayMs?: number
}

export const HookCard = memo(function HookCard({
  hook,
  index,
  tone,
  platform,
  saved = false,
  saving = false,
  copied = false,
  copyDisabled = false,
  justSaved = false,
  onCopy,
  onToggleSave,
  onRemove,
  onRegenerate,
  showIndex = true,
  variant = 'result',
  savedAt,
  className,
  animationDelayMs = 0,
}: HookCardProps) {
  const charState = getHookCharState(hook.length)
  const charClass = getHookCharCountClass(charState)
  const toneLabel = getToneLabel(tone)
  const platformLabel = getPlatformLabel(platform)

  return (
    <article
      className={cn(
        'hook-card group relative overflow-hidden rounded-2xl border',
        'bg-gradient-to-br from-zinc-950/95 to-zinc-900/50',
        'p-4 sm:p-5 transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-violet-500/35',
        'hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.45)]',
        saved && 'border-amber-500/25 shadow-[0_0_28px_-14px_rgba(245,158,11,0.35)]',
        justSaved && 'animate-save-glow border-amber-400/40',
        !saved && 'border-zinc-800/70',
        'animate-fade-in',
        className,
      )}
      style={{ animationDelay: `${animationDelayMs}ms`, animationFillMode: 'backwards' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      >
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-fuchsia-500/8 blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-3.5 sm:flex-row sm:items-start sm:gap-4">
        {showIndex && typeof index === 'number' && (
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-9',
              'bg-violet-500/15 text-xs font-bold tabular-nums text-violet-300',
              'ring-1 ring-violet-500/25 transition-smooth group-hover:bg-violet-500/20',
            )}
            aria-hidden
          >
            {index + 1}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="break-words text-[15px] font-medium leading-[1.55] text-zinc-50 sm:text-base sm:leading-relaxed">
            {hook}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {toneLabel && (
              <span className="hook-badge hook-badge--tone">{toneLabel}</span>
            )}
            {platformLabel && (
              <span className="hook-badge hook-badge--platform">{platformLabel}</span>
            )}
            <span className={cn('hook-badge hook-badge--chars', charClass)}>
              {hook.length}/{HOOK_CHAR_LIMIT}
            </span>
            {savedAt && variant === 'saved' && (
              <span className="text-[10px] font-medium text-zinc-600">
                {formatHookDate(savedAt, 'relative')}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto sm:flex-col sm:items-stretch sm:gap-1.5">
          {onToggleSave && variant === 'result' && (
            <button
              type="button"
              disabled={saving}
              onClick={onToggleSave}
              className={cn(
                'hook-action-btn flex-1 sm:flex-none',
                saved
                  ? 'text-amber-400 hover:bg-amber-500/12 hover:text-amber-300'
                  : 'text-zinc-500 hover:bg-zinc-800/90 hover:text-amber-300',
                saving && 'opacity-50',
                saved && !saving && 'animate-bookmark-pop',
              )}
              aria-label={saved ? 'Hook aus Gespeichert entfernen' : `Hook ${(index ?? 0) + 1} speichern`}
              aria-pressed={saved}
            >
              {saved ? (
                <BookmarkFilledIcon className="size-[18px] drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              ) : (
                <BookmarkIcon className="size-[18px]" />
              )}
            </button>
          )}

          {onCopy && (
            <button
              type="button"
              disabled={copyDisabled && !copied}
              onClick={onCopy}
              className={cn(
                'hook-action-btn flex-1 sm:flex-none',
                copied
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25'
                  : 'text-zinc-500 hover:bg-violet-500/15 hover:text-violet-200',
                copyDisabled && !copied && 'opacity-50',
              )}
              aria-label={copied ? 'Kopiert' : `Hook ${(index ?? 0) + 1} kopieren`}
            >
              {copied ? (
                <CheckIcon className="size-[18px] animate-fade-in-scale" />
              ) : (
                <CopyIcon className="size-[18px]" />
              )}
            </button>
          )}
        </div>
      </div>

      {variant === 'saved' && (onRegenerate || onRemove) && (
        <div className="relative mt-3.5 flex flex-col gap-2 border-t border-zinc-800/60 pt-3.5 sm:flex-row">
          {onRegenerate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRegenerate}
              className="min-h-11 flex-1 sm:min-h-9"
            >
              <ArrowPathIcon className="size-3.5" aria-hidden />
              Regenerieren
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="min-h-11 flex-1 sm:min-h-9"
            >
              <TrashIcon className="size-3.5" aria-hidden />
              Entfernen
            </Button>
          )}
        </div>
      )}
    </article>
  )
})

HookCard.displayName = 'HookCard'
