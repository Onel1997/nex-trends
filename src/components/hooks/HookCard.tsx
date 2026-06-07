import { memo, useCallback, useMemo, useState } from 'react'
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
  formatRetentionScore,
  getHookCharCountClass,
  getHookCharState,
  getPlatformLabel,
  getRetentionScoreClass,
  getToneLabel,
  hasPremiumMetadata,
  HOOK_CHAR_LIMIT,
} from '@/lib/hook-display'
import { formatHookDisplayText } from '@/lib/ai/parse-hooks-response'
import { cn } from '@/lib'
import type { PremiumHook } from '@/types/ai-generation'

export type HookCardProps = {
  hook: string | PremiumHook
  index?: number
  tone?: string | null
  platform?: string | null
  saved?: boolean
  saving?: boolean
  removing?: boolean
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
  removing = false,
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
  const [whyExpanded, setWhyExpanded] = useState(false)

  const hookText = formatHookDisplayText(hook)
  const premium = typeof hook === 'object' && hook !== null ? hook : null
  const isPremium = premium ? hasPremiumMetadata(premium) : false

  const charState = getHookCharState(hookText.length)
  const charClass = getHookCharCountClass(charState)
  const toneLabel = getToneLabel(tone)
  const platformLabel = getPlatformLabel(platform)
  const scoreLabel = premium ? formatRetentionScore(premium.retentionScore) : ''

  const toggleWhy = useCallback(() => {
    setWhyExpanded((prev) => !prev)
  }, [])

  const whyId = useMemo(
    () => `hook-why-${index ?? 'x'}-${hookText.slice(0, 12).replace(/\s+/g, '-')}`,
    [index, hookText],
  )

  return (
    <article
      className={cn(
        'hook-card group h-auto max-h-none p-4 sm:p-5',
        saved && 'hook-card--saved',
        justSaved && 'animate-save-glow border-amber-400/40',
        removing && 'hook-card--removing',
        className,
      )}
      style={
        animationDelayMs > 0
          ? { animationDelay: `${animationDelayMs}ms`, animationFillMode: 'backwards' }
          : undefined
      }
    >
      <div className="hook-card__glow" aria-hidden>
        <div className="absolute -right-10 -top-10 size-32 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-fuchsia-500/8 blur-2xl" />
      </div>

      <div className="hook-card__inner relative flex flex-col gap-3.5 sm:flex-row sm:items-start sm:gap-4">
        {showIndex && typeof index === 'number' && (
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-9',
              'bg-violet-500/15 text-xs font-bold tabular-nums text-violet-300',
              'ring-1 ring-violet-500/25 transition-smooth group-hover:bg-violet-500/22 group-hover:ring-violet-500/35',
            )}
            aria-hidden
          >
            {index + 1}
          </span>
        )}

        <div className="hook-card__content min-w-0 flex-1">
          <p className="hook-card__text break-words text-[15px] font-medium leading-[1.6] tracking-tight text-zinc-50 sm:text-base sm:leading-relaxed">
            {hookText}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {isPremium && scoreLabel && premium && (
              <span
                className={cn(
                  'hook-badge hook-badge--score',
                  getRetentionScoreClass(premium.retentionScore),
                )}
                title="Retention Score"
              >
                {scoreLabel}
              </span>
            )}
            {isPremium && premium?.framework && (
              <span className="hook-badge hook-badge--framework" title="Framework">
                {premium.framework}
              </span>
            )}
            {isPremium && premium?.trigger && (
              <span className="hook-badge hook-badge--trigger" title="Psychologischer Trigger">
                {premium.trigger}
              </span>
            )}
            {toneLabel && <span className="hook-badge hook-badge--tone">{toneLabel}</span>}
            {platformLabel && (
              <span className="hook-badge hook-badge--platform">{platformLabel}</span>
            )}
            <span className={cn('hook-badge hook-badge--chars', charClass)}>
              {hookText.length}/{HOOK_CHAR_LIMIT}
            </span>
            {savedAt && variant === 'saved' && (
              <span className="text-[10px] font-medium text-zinc-500">
                {formatHookDate(savedAt, 'relative')}
              </span>
            )}
          </div>

          {isPremium && premium?.whyItWorks && variant === 'result' && (
            <div className="mt-3">
              <button
                type="button"
                onClick={toggleWhy}
                className="flex min-h-9 items-center gap-1.5 text-xs font-semibold text-violet-300/90 transition-smooth hover:text-violet-200"
                aria-expanded={whyExpanded}
                aria-controls={whyId}
              >
                <span
                  className={cn(
                    'inline-block text-[10px] transition-transform duration-200',
                    whyExpanded && 'rotate-90',
                  )}
                  aria-hidden
                >
                  ▶
                </span>
                Why It Works
              </button>
              <div
                id={whyId}
                className={cn(
                  'grid transition-all duration-200 ease-out',
                  whyExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <p className="rounded-lg border border-violet-500/15 bg-violet-500/5 px-3 py-2.5 text-xs leading-relaxed text-zinc-300">
                    {premium.whyItWorks}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hook-card__actions flex w-full shrink-0 items-stretch gap-2 sm:w-auto sm:flex-col sm:gap-1.5">
          {onToggleSave && variant === 'result' && (
            <button
              type="button"
              disabled={saving}
              onClick={onToggleSave}
              className={cn(
                'hook-action-btn flex flex-1 items-center justify-center gap-1.5 sm:flex-none sm:min-w-[2.75rem]',
                saved
                  ? 'text-amber-400 hover:bg-amber-500/12 hover:text-amber-300'
                  : 'text-zinc-500 hover:bg-zinc-800/90 hover:text-amber-300',
                saving && 'opacity-50',
                saved && !saving && 'animate-bookmark-pop',
              )}
              aria-label={
                saved ? 'Hook aus Gespeichert entfernen' : `Hook ${(index ?? 0) + 1} speichern`
              }
              aria-pressed={saved}
            >
              {saved ? (
                <BookmarkFilledIcon className="size-[18px] drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              ) : (
                <BookmarkIcon className="size-[18px]" />
              )}
              <span className="text-[11px] font-semibold sm:sr-only">
                {saved ? 'Gespeichert' : 'Speichern'}
              </span>
            </button>
          )}

          {onCopy && (
            <button
              type="button"
              disabled={copyDisabled && !copied}
              onClick={onCopy}
              className={cn(
                'hook-action-btn flex flex-1 items-center justify-center gap-1.5 sm:flex-none sm:min-w-[2.75rem]',
                copied
                  ? 'hook-action-btn--copied'
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
              <span className="text-[11px] font-semibold sm:sr-only">
                {copied ? 'Kopiert' : 'Kopieren'}
              </span>
            </button>
          )}
        </div>
      </div>

      {variant === 'saved' && (onRegenerate || onRemove) && (
        <div className="relative mt-3.5 flex flex-col gap-2 border-t border-zinc-800/55 pt-3.5 sm:flex-row">
          {onRegenerate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRegenerate}
              disabled={removing}
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
              disabled={removing}
              className="min-h-11 flex-1 sm:min-h-9"
            >
              <TrashIcon className="size-3.5" aria-hidden />
              {removing ? 'Entfernen …' : 'Entfernen'}
            </Button>
          )}
        </div>
      )}
    </article>
  )
})

HookCard.displayName = 'HookCard'
