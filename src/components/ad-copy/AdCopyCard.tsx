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
  AD_HEADLINE_LIMIT,
  AD_HEADLINE_OPTIMAL,
  AD_PRIMARY_LIMIT,
  AD_PRIMARY_OPTIMAL,
  formatAdCopyDate,
  getAdCharCountClass,
  getAdCharState,
  getAdCopyPlatformLabel,
  getAdCopyToneLabel,
  getAdCopyTotalChars,
  getCtaLabel,
} from '@/lib/ad-copy-display'
import { cn } from '@/lib'
import type { AdCopyVariant } from '@/types/ad-copy-generation'

export type AdCopyCardProps = {
  variant: AdCopyVariant
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
  variantType?: 'result' | 'saved'
  savedAt?: string | null
  className?: string
  animationDelayMs?: number
}

export const AdCopyCard = memo(function AdCopyCard({
  variant,
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
  variantType = 'result',
  savedAt,
  className,
  animationDelayMs = 0,
}: AdCopyCardProps) {
  const headlineState = getAdCharState(variant.headline.length, AD_HEADLINE_OPTIMAL, AD_HEADLINE_LIMIT)
  const primaryState = getAdCharState(variant.primaryText.length, AD_PRIMARY_OPTIMAL, AD_PRIMARY_LIMIT)
  const totalChars = getAdCopyTotalChars(variant)
  const toneLabel = getAdCopyToneLabel(tone)
  const platformLabel = getAdCopyPlatformLabel(platform)
  const ctaLabel = getCtaLabel(variant.cta)

  return (
    <article
      className={cn(
        'ad-copy-card overflow-hidden px-4 py-4 sm:px-5 sm:py-5',
        saved && 'ad-copy-card--saved',
        justSaved && 'animate-save-glow border-amber-400/35',
        removing && 'ad-copy-card--removing',
        className,
      )}
      style={
        animationDelayMs > 0
          ? { animationDelay: `${animationDelayMs}ms`, animationFillMode: 'backwards' }
          : undefined
      }
    >
      <div className="ad-copy-card__glow" aria-hidden />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          {showIndex && typeof index === 'number' ? (
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                'bg-violet-500/12 text-[11px] font-bold tabular-nums text-violet-300/95',
                'ring-1 ring-violet-500/20',
              )}
              aria-hidden
            >
              {index + 1}
            </span>
          ) : (
            <span className="sr-only">Ad Copy</span>
          )}

          {(onToggleSave || onCopy) && (
            <div className="ml-auto flex shrink-0 items-center gap-1">
              {onToggleSave && variantType === 'result' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={onToggleSave}
                  className={cn(
                    'hook-action-btn !min-h-10 !min-w-10 !rounded-xl',
                    saved
                      ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                      : 'text-zinc-500 hover:bg-zinc-800/80 hover:text-amber-300',
                    saving && 'opacity-50',
                    saved && !saving && 'animate-bookmark-pop',
                  )}
                  aria-label={
                    saved ? 'Ad aus Gespeichert entfernen' : `Ad ${(index ?? 0) + 1} speichern`
                  }
                  aria-pressed={saved}
                >
                  {saved ? (
                    <BookmarkFilledIcon className="size-[17px] drop-shadow-[0_0_6px_rgba(245,158,11,0.45)]" />
                  ) : (
                    <BookmarkIcon className="size-[17px]" />
                  )}
                </button>
              )}

              {onCopy && (
                <button
                  type="button"
                  disabled={copyDisabled && !copied}
                  onClick={onCopy}
                  className={cn(
                    'hook-action-btn !min-h-10 !min-w-10 !rounded-xl',
                    copied
                      ? 'hook-action-btn--copied'
                      : 'text-zinc-500 hover:bg-violet-500/12 hover:text-violet-200',
                    copyDisabled && !copied && 'opacity-50',
                  )}
                  aria-label={copied ? 'Kopiert' : `Ad ${(index ?? 0) + 1} kopieren`}
                >
                  {copied ? (
                    <CheckIcon className="size-[17px] animate-fade-in-scale" />
                  ) : (
                    <CopyIcon className="size-[17px]" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 min-w-0 space-y-3">
          <h3 className="break-words text-[15px] font-semibold leading-snug tracking-tight text-zinc-50 sm:text-base sm:leading-snug">
            {variant.headline}
          </h3>

          <p className="break-words text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-relaxed">
            {variant.primaryText}
          </p>

          <p className="break-words text-sm font-medium text-violet-200/90">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400/75">
              CTA{' '}
            </span>
            {variant.cta}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {toneLabel && <span className="hook-badge hook-badge--tone">{toneLabel}</span>}
          {platformLabel && (
            <span className="hook-badge hook-badge--platform">{platformLabel}</span>
          )}
          {ctaLabel && <span className="hook-badge hook-badge--platform">{ctaLabel}</span>}
          <span
            className={cn('hook-badge hook-badge--chars', getAdCharCountClass(headlineState))}
            title="Headline Zeichen"
          >
            H {variant.headline.length}/{AD_HEADLINE_LIMIT}
          </span>
          <span
            className={cn('hook-badge hook-badge--chars', getAdCharCountClass(primaryState))}
            title="Primary Text Zeichen"
          >
            P {variant.primaryText.length}/{AD_PRIMARY_LIMIT}
          </span>
          <span className="hook-badge hook-badge--chars text-zinc-500">Σ {totalChars}</span>
          {savedAt && variantType === 'saved' && (
            <span className="text-[10px] font-medium text-zinc-600">
              {formatAdCopyDate(savedAt, 'relative')}
            </span>
          )}
        </div>

        {variantType === 'saved' && (onRegenerate || onRemove) && (
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800/45 pt-4 sm:flex-row">
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
      </div>
    </article>
  )
})

AdCopyCard.displayName = 'AdCopyCard'
