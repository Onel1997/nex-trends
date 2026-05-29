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
  formatSeoTitleDate,
  getScoreBadgeClass,
  getSeoIntentLabel,
  getSeoPlatformLabel,
  getSeoTitleCharCountClass,
  getSeoTitleCharLabel,
  getSeoTitleCharState,
} from '@/lib/seo-title-display'
import { cn } from '@/lib'
import type { SeoTitleVariant } from '@/types/seo-title-generation'

export type SeoTitleCardProps = {
  variant: SeoTitleVariant
  index?: number
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

function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <span className={cn('seo-score-badge', getScoreBadgeClass(score))} title={label}>
      <span className="seo-score-badge__label">{label}</span>
      <span className="seo-score-badge__value tabular-nums">{score}</span>
    </span>
  )
}

export const SeoTitleCard = memo(function SeoTitleCard({
  variant,
  index,
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
}: SeoTitleCardProps) {
  const charLen = variant.title.length
  const charState = getSeoTitleCharState(charLen)
  const platformLabel = getSeoPlatformLabel(platform)
  const intentLabel = getSeoIntentLabel(variant.searchIntent)

  return (
    <article
      className={cn(
        'seo-title-card overflow-hidden px-4 py-4 sm:px-5 sm:py-[1.35rem]',
        saved && 'seo-title-card--saved',
        copied && 'seo-title-card--copied',
        justSaved && 'animate-save-glow border-amber-400/35',
        removing && 'seo-title-card--removing',
        className,
      )}
      style={
        animationDelayMs > 0
          ? { animationDelay: `${animationDelayMs}ms`, animationFillMode: 'backwards' }
          : undefined
      }
    >
      <div className="seo-title-card__glow" aria-hidden />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          {showIndex && typeof index === 'number' ? (
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-[11px] font-bold tabular-nums text-cyan-300/95 ring-1 ring-cyan-500/20"
              aria-hidden
            >
              {index + 1}
            </span>
          ) : (
            <span className="sr-only">SEO Titel</span>
          )}

          {(onToggleSave || onCopy) && (
            <div className="ml-auto flex shrink-0 items-center gap-1">
              {onToggleSave && variantType === 'result' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={onToggleSave}
                  className={cn(
                    'hook-action-btn ad-copy-bookmark-btn !min-h-11 !min-w-11 !rounded-xl sm:!min-h-10 sm:!min-w-10',
                    saved
                      ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                      : 'text-zinc-500 hover:bg-zinc-800/80 hover:text-amber-300',
                    saving && 'opacity-50',
                    saved && !saving && !justSaved && 'animate-bookmark-pop',
                    justSaved && 'animate-bookmark-save',
                    saved && 'ad-copy-bookmark-btn--saved',
                  )}
                  aria-label={saved ? 'Titel entfernen' : `Titel ${(index ?? 0) + 1} speichern`}
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
                    'hook-action-btn !min-h-11 !min-w-11 !rounded-xl sm:!min-h-10 sm:!min-w-10',
                    copied
                      ? 'hook-action-btn--copied'
                      : 'text-zinc-500 hover:bg-violet-500/12 hover:text-violet-200',
                    copyDisabled && !copied && 'opacity-50',
                  )}
                  aria-label={copied ? 'Kopiert' : `Titel ${(index ?? 0) + 1} kopieren`}
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

        <h3 className="mt-3.5 break-words text-[15px] font-semibold leading-[1.4] tracking-tight text-zinc-50 sm:mt-4 sm:text-[1.05rem] sm:leading-snug">
          {variant.title}
        </h3>

        <div className="mt-3.5 flex flex-wrap gap-1.5 sm:mt-4">
          <ScoreBadge label="SEO" score={variant.seoScore} />
          <ScoreBadge label="CTR" score={variant.ctrScore} />
          <ScoreBadge label="Lesbar" score={variant.readabilityScore} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="hook-badge hook-badge--tone">{variant.keyword}</span>
          {intentLabel && <span className="hook-badge hook-badge--platform">{intentLabel}</span>}
          {platformLabel && <span className="hook-badge hook-badge--platform">{platformLabel}</span>}
          <span
            className={cn('hook-badge hook-badge--chars', getSeoTitleCharCountClass(charState))}
            title="Zeichenlänge"
          >
            {charLen} Z · {getSeoTitleCharLabel(charState)}
          </span>
          {savedAt && variantType === 'saved' && (
            <span className="text-[10px] font-medium text-zinc-600">
              {formatSeoTitleDate(savedAt, 'relative')}
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

SeoTitleCard.displayName = 'SeoTitleCard'
