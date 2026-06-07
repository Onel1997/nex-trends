import { memo, useCallback, type KeyboardEvent, type MouseEvent } from 'react'
import { cn } from '@/lib'
import { OPPORTUNITY_TIER_META } from '@/lib/trend-v2'
import type { TrendWithV2 } from '@/lib/trend-v2'
import { TrendStatusBadgeV2 } from '@/components/trends/v2/TrendStatusBadgeV2'
import { TREND_CATEGORY_V2_LABELS } from '@/types/trend-v2'
import { Button } from '@/components/ui/Button'
import {
  BookmarkIcon,
  BookmarkFilledIcon,
  BoltIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'

type TrendCardV2Props = {
  trend: TrendWithV2
  rank?: number
  isSaved?: boolean
  onToggleSave?: (trend: TrendWithV2) => boolean
  onGenerateHook?: (trend: TrendWithV2) => void
  onClick?: () => void
}

function ScoreMeter({
  label,
  score,
  textClass,
  barClass,
}: {
  label: string
  score: number
  textClass: string
  barClass: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        <span className={cn('text-sm font-bold tabular-nums', textClass)}>{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barClass)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  )
}

function TrendCardV2Component({
  trend,
  rank,
  isSaved,
  onToggleSave,
  onGenerateHook,
  onClick,
}: TrendCardV2Props) {
  const { showToast } = useToast()
  const { v2 } = trend
  const tierMeta = OPPORTUNITY_TIER_META[v2.opportunityTier]
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')
  const growthPositive = v2.growthPercent >= 0

  const handleSave = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!onToggleSave) return
      const nowSaved = onToggleSave(trend)
      showToast({
        type: 'success',
        title: nowSaved ? 'Trend gespeichert' : 'Trend entfernt',
        message: nowSaved ? 'In deiner Bibliothek unter Gespeichert.' : undefined,
      })
    },
    [onToggleSave, showToast, trend],
  )

  const handleGenerateHook = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onGenerateHook?.(trend)
    },
    [onGenerateHook, trend],
  )

  const handleCardClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const handleCardKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!onClick) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
    [onClick],
  )

  return (
    <article
      className={cn(
        'ti-v2-card group relative flex flex-col gap-4 rounded-2xl p-4 sm:p-5',
        'border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_32px_-12px_rgba(0,0,0,0.5)]',
        'transition-smooth touch-manipulation',
        'hover:border-violet-500/25 hover:bg-zinc-900/55',
        'active:scale-[0.995] sm:active:scale-100',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick ? handleCardClick : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleCardKeyDown : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {typeof rank === 'number' && (
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-[10px] font-bold tabular-nums text-zinc-400">
                {rank}
              </span>
            )}
            <TrendStatusBadgeV2 status={v2.status} />
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset',
                isTikTok
                  ? 'bg-black/50 text-white ring-white/10'
                  : 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white ring-white/10',
              )}
            >
              {isTikTok ? 'TikTok' : 'Reels'}
            </span>
            <span className="rounded-full bg-zinc-800/70 px-2 py-0.5 text-[9px] font-semibold text-zinc-400 ring-1 ring-zinc-700/50">
              {TREND_CATEGORY_V2_LABELS[v2.category]}
            </span>
          </div>

          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white sm:text-[17px]">
            {trend.title}
          </h3>

          {trend.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
              {trend.description}
            </p>
          )}
        </div>

        {onToggleSave && (
          <button
            type="button"
            aria-label={isSaved ? 'Trend entfernen' : 'Trend speichern'}
            aria-pressed={isSaved}
            onClick={handleSave}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className={cn(
              'shrink-0 rounded-xl p-2.5 transition-smooth touch-manipulation',
              'border border-zinc-800/70 bg-zinc-950/50 text-zinc-400',
              'hover:border-violet-500/30 hover:text-violet-200 active:scale-95',
              isSaved && 'border-violet-500/35 bg-violet-500/10 text-violet-300',
            )}
          >
            {isSaved ? (
              <BookmarkFilledIcon className="size-[18px]" aria-hidden />
            ) : (
              <BookmarkIcon className="size-[18px]" aria-hidden />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <ScoreMeter
          label="Trend Score"
          score={v2.trendScore}
          textClass="text-violet-300"
          barClass="bg-violet-500"
        />
        <ScoreMeter
          label="Opportunity"
          score={v2.opportunityScore}
          textClass={
            v2.opportunityScore >= 80
              ? 'text-fuchsia-300'
              : v2.opportunityScore >= 60
                ? 'text-emerald-300'
                : 'text-zinc-400'
          }
          barClass={
            v2.opportunityScore >= 80
              ? 'bg-fuchsia-500'
              : v2.opportunityScore >= 60
                ? 'bg-emerald-500'
                : 'bg-zinc-500'
          }
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800/50 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums ring-1 ring-inset',
                growthPositive
                  ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25'
                  : 'bg-red-500/10 text-red-300 ring-red-500/25',
              )}
            >
              <TrendingUpIcon
                className={cn('size-3.5', !growthPositive && 'rotate-180')}
                aria-hidden
              />
              {growthPositive ? '+' : ''}
              {v2.growthPercent.toFixed(1)}%
            </span>
            <span className="text-[11px] text-zinc-600">Growth</span>
          </div>

          <p className={cn('text-[11px] font-semibold', tierMeta.className)}>{tierMeta.label}</p>
        </div>

        {onGenerateHook && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleGenerateHook}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className={cn(
              'min-h-11 touch-manipulation sm:min-h-10',
              'border-violet-500/20 bg-violet-500/8 text-violet-100',
              'hover:border-violet-500/35 hover:bg-violet-500/14 hover:text-white',
            )}
          >
            <BoltIcon className="size-3.5 shrink-0" aria-hidden />
            Hook generieren
          </Button>
        )}
      </div>
    </article>
  )
}

export const TrendCardV2 = memo(TrendCardV2Component, (prev, next) => {
  return (
    prev.trend.id === next.trend.id &&
    prev.isSaved === next.isSaved &&
    prev.rank === next.rank &&
    prev.onToggleSave === next.onToggleSave &&
    prev.onGenerateHook === next.onGenerateHook &&
    prev.onClick === next.onClick
  )
})
