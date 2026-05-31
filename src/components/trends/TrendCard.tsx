import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { cn } from '@/lib'
import { VideoCard } from '@/components/trends/VideoCard'
import { pickNextFallbackMedia } from '@/lib/trend-media-assignment'
import { TrendMetricsStrip } from '@/components/trends/TrendMetricsStrip'
import { TrendScoreStrip } from '@/components/trends/TrendScoreStrip'
import { TrendStateBadge } from '@/components/trends/TrendStateBadge'
import { ViralScoreRing } from '@/components/trends/ViralScoreRing'
import {
  BookmarkIcon,
  BookmarkFilledIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  SparklesIcon,
  VerifiedIcon,
} from '@/components/ui/icons'
import { useToast } from '@/context/ToastContext'
import { buildHookBreakdown } from '@/lib/trend-analysis-copy'
import { getViralScoreTone, VELOCITY_META } from '@/lib/trend-intelligence'
import { shareTrend } from '@/lib/share-trend'
import type { VideoPreloadTier } from '@/lib/video-feed-preload'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import { TrendDetailModalLoading } from '@/components/trends/TrendDetailModalLoading'

const TrendDetailModal = lazy(() =>
  import('@/components/trends/TrendDetailModal').then((m) => ({
    default: m.TrendDetailModal,
  })),
)

export type DisplayTrend = TrendIntelligence

type TrendCardProps = {
  trend: TrendIntelligence
  onClick?: () => void
  onOpenAnalyse?: () => void
  priority?: boolean
  feedIndex?: number
  preloadTier?: VideoPreloadTier
  isSaved?: boolean
  onToggleSave?: (trend: TrendIntelligence) => boolean
  feedVideoUrls?: readonly string[]
}

function TrendCardComponent({
  trend,
  onClick,
  onOpenAnalyse,
  priority = false,
  feedIndex = -1,
  preloadTier = 'none',
  isSaved,
  onToggleSave,
  feedVideoUrls = [],
}: TrendCardProps) {
  const { showToast } = useToast()
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')
  const velocity = VELOCITY_META[trend.trendVelocity]
  const scoreTone = getViralScoreTone(trend.viralScore)
  const failedVideosRef = useRef(new Set<string>())
  const [hookExpanded, setHookExpanded] = useState(false)
  const [internalAnalyseOpen, setInternalAnalyseOpen] = useState(false)
  const openingRef = useRef(false)
  const [media, setMedia] = useState({
    videoUrl: trend.videoUrl,
    thumbnailUrl: trend.thumbnailUrl,
    videoDuration: trend.videoDuration,
  })

  const usesExternalAnalyse = Boolean(onOpenAnalyse ?? onClick)
  const hookBreakdown = buildHookBreakdown(trend)

  useEffect(() => {
    failedVideosRef.current.clear()
    setMedia({
      videoUrl: trend.videoUrl,
      thumbnailUrl: trend.thumbnailUrl,
      videoDuration: trend.videoDuration,
    })
  }, [trend.id, trend.videoUrl, trend.thumbnailUrl, trend.videoDuration])

  const handleVideoUnavailable = useCallback(() => {
    if (media.videoUrl) failedVideosRef.current.add(media.videoUrl)
    const exclude = new Set(failedVideosRef.current)
    for (const url of feedVideoUrls) {
      if (url && url !== media.videoUrl) exclude.add(url)
    }
    const next = pickNextFallbackMedia(trend.id, trend.niche, media.videoUrl, exclude)
    setMedia({
      videoUrl: next.video,
      thumbnailUrl: next.poster,
      videoDuration: next.duration,
    })
  }, [trend.id, trend.niche, media.videoUrl, feedVideoUrls])

  const openAnalyse = useCallback(() => {
    if (openingRef.current) return
    openingRef.current = true
    window.setTimeout(() => {
      openingRef.current = false
    }, 500)

    if (onOpenAnalyse) {
      onOpenAnalyse()
      return
    }
    if (onClick) {
      onClick()
      return
    }
    setInternalAnalyseOpen(true)
  }, [onClick, onOpenAnalyse])

  const stopCardEvent = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleSave = useCallback(
    (e: MouseEvent) => {
      stopCardEvent(e)
      if (!onToggleSave) return
      const nowSaved = onToggleSave(trend)
      if (nowSaved === false) {
        showToast({ type: 'success', title: 'Trend entfernt' })
        return
      }
      showToast({
        type: 'success',
        title: 'Trend gespeichert',
        message: 'In deiner Bibliothek unter Gespeichert.',
      })
    },
    [onToggleSave, showToast, stopCardEvent, trend],
  )

  const handleShare = useCallback(
    async (e: MouseEvent) => {
      stopCardEvent(e)
      try {
        const result = await shareTrend(trend)
        if (result === 'cancelled') return
        if (result === 'shared') {
          showToast({ type: 'success', title: 'Geteilt' })
          return
        }
        showToast({ type: 'success', title: 'Link kopiert' })
      } catch {
        showToast({ type: 'error', title: 'Teilen fehlgeschlagen' })
      }
    },
    [showToast, stopCardEvent, trend],
  )

  const handleOpenAnalyse = useCallback(
    (e: MouseEvent) => {
      stopCardEvent(e)
      openAnalyse()
    },
    [openAnalyse, stopCardEvent],
  )

  const toggleHookDetails = useCallback(
    (e: MouseEvent) => {
      stopCardEvent(e)
      setHookExpanded((prev) => !prev)
    },
    [stopCardEvent],
  )

  return (
    <>
      <article
        className={cn(
          'trend-card group relative flex flex-col overflow-hidden rounded-2xl',
          'border border-zinc-800/50 bg-zinc-900/30',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_4px_24px_-8px_rgba(0,0,0,0.4)]',
          'transition-smooth touch-manipulation',
          'hover:-translate-y-0.5 hover:border-violet-500/20 hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.25)]',
          'active:scale-[0.985] active:opacity-95 sm:active:scale-100 sm:active:opacity-100',
        )}
      >
        <div className="relative w-full overflow-hidden">
          <VideoCard
            playbackId={trend.id}
            posterUrl={media.thumbnailUrl}
            videoUrl={media.videoUrl}
            alt={trend.title}
            duration={media.videoDuration}
            aspectClass="relative z-[40] aspect-[9/16] w-full"
            priority={priority}
            feedIndex={feedIndex}
            preloadTier={preloadTier}
            onVideoUnavailable={handleVideoUnavailable}
          />

          <div className="trend-card__top-overlay pointer-events-none absolute inset-x-0 top-0 z-[25]">
            <div className="trend-card__top-bar">
              <div className="trend-card__meta-zone">
                <span
                  className={cn(
                    'trend-card__pill trend-card__pill--platform',
                    isTikTok
                      ? 'bg-black/60 text-white ring-1 ring-white/10'
                      : 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white ring-1 ring-white/10',
                  )}
                >
                  {isTikTok ? 'TikTok' : 'Reels'}
                </span>
                {trend.contentBreakdown?.audioTrend && (
                  <span className="trend-card__pill trend-card__pill--audio">
                    ♪ {trend.contentBreakdown.audioTrend.split('—')[0].trim().slice(0, 28)}
                  </span>
                )}
                {trend.niche && (
                  <span className="trend-card__pill trend-card__pill--niche">{trend.niche}</span>
                )}
                {trend.trendState && (
                  <span className="trend-card__pill trend-card__pill--state pointer-events-auto shrink-0">
                    <TrendStateBadge state={trend.trendState} />
                  </span>
                )}
              </div>
              <span className="trend-card__top-bar-spacer" aria-hidden />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[20] bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 pb-3.5 pt-14 sm:pt-12">
            <div className="flex items-end justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <img
                  src={trend.creator.avatarUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-7 shrink-0 rounded-full object-cover ring-2 ring-white/15"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-0.5 truncate text-xs font-semibold text-white">
                    {trend.creator.handle}
                    {trend.creator.verified && (
                      <VerifiedIcon className="size-3 shrink-0 text-sky-300" aria-hidden />
                    )}
                  </p>
                  <p className="text-[10px] text-white/60">{trend.creator.followers}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5 pl-1">
                <ViralScoreRing score={trend.viralScore} size="sm" animate={priority} />
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset backdrop-blur-sm',
                    velocity.className,
                  )}
                >
                  {velocity.icon} {velocity.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-3.5 sm:gap-3.5 sm:p-4">
          <button
            type="button"
            onClick={handleOpenAnalyse}
            className={cn(
              'trend-card__content-tap w-full rounded-xl text-left transition-smooth',
              'hover:bg-zinc-900/25 active:scale-[0.995]',
            )}
            aria-label={`${trend.title} — AI Analyse öffnen`}
          >
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white">
                {trend.title}
              </h3>
              {trend.description && (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
                  {trend.description}
                </p>
              )}
            </div>

            <div className="mt-3 space-y-3">
              <TrendScoreStrip
                momentum={trend.momentumScore}
                competition={trend.competitionScore}
                opportunity={trend.opportunityScore}
                compact
              />

              <TrendMetricsStrip trend={trend} variant="card" />

              <div className="flex items-center gap-3 text-[11px] tabular-nums text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <EyeIcon className="size-3.5" aria-hidden />
                  {trend.views}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HeartIcon className="size-3.5 text-rose-400/70" aria-hidden />
                  {trend.likes}
                </span>
                <span className={cn('ml-auto font-semibold', scoreTone.textClass)}>
                  {trend.engagementRate}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {trend.hashtags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-zinc-950/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 ring-1 ring-zinc-800/50"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>

              {trend.aiInsight && (
                <div className="flex items-start gap-2 rounded-xl border border-violet-500/15 bg-violet-500/[0.06] px-3 py-2">
                  <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-violet-400/90" aria-hidden />
                  <p className="text-[11px] leading-snug text-violet-200/90">{trend.aiInsight}</p>
                </div>
              )}
            </div>
          </button>

          <div className="trend-card__hook rounded-xl border border-zinc-800/40 bg-zinc-950/40 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Hook</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{trend.hookAnalysis.hookText}</p>
              </div>
              <button
                type="button"
                onClick={toggleHookDetails}
                aria-expanded={hookExpanded}
                className={cn(
                  'trend-card__hook-details inline-flex shrink-0 items-center gap-1 rounded-lg',
                  'border border-zinc-700/50 bg-zinc-900/60 px-2 py-1 text-[10px] font-semibold text-zinc-400',
                  'transition-smooth hover:border-violet-500/25 hover:text-violet-200 active:scale-95',
                  hookExpanded && 'border-violet-500/30 text-violet-200',
                )}
              >
                Details
                <span
                  className={cn(
                    'inline-block text-[8px] leading-none transition-transform duration-200',
                    hookExpanded && 'rotate-180',
                  )}
                  aria-hidden
                >
                  ▾
                </span>
              </button>
            </div>

            {hookExpanded && (
              <div className="trend-card__hook-breakdown mt-3 space-y-2 border-t border-zinc-800/50 pt-3 animate-fade-in">
                <HookDetail label="Emotional Trigger" value={hookBreakdown.emotionalTrigger} />
                <HookDetail label="Retention Type" value={hookBreakdown.retentionType} />
                <HookDetail label="Why it works" value={hookBreakdown.whyItWorks} />
                <HookDetail label="CTA Psychology" value={hookBreakdown.ctaPsychology} />
                <button
                  type="button"
                  onClick={handleOpenAnalyse}
                  className="mt-1 text-[10px] font-semibold text-violet-300/90 transition-smooth hover:text-violet-200"
                >
                  Vollständige AI-Analyse →
                </button>
              </div>
            )}
          </div>

          <div className="trend-card__actions">
            {onToggleSave ? (
              <button
                type="button"
                aria-label={isSaved ? 'Trend entfernen' : 'Trend speichern'}
                aria-pressed={isSaved}
                onClick={handleSave}
                onPointerDown={stopCardEvent}
                className={cn(
                  'trend-card__action trend-card__action--icon',
                  isSaved && 'trend-card__action--icon-saved',
                )}
              >
                {isSaved ? (
                  <BookmarkFilledIcon className="size-[18px]" aria-hidden />
                ) : (
                  <BookmarkIcon className="size-[18px]" aria-hidden />
                )}
              </button>
            ) : (
              <span className="trend-card__action-spacer" aria-hidden />
            )}

            <button
              type="button"
              onClick={handleOpenAnalyse}
              onPointerDown={stopCardEvent}
              className="trend-card__action trend-card__action--primary"
            >
              <SparklesIcon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">AI Analyse öffnen</span>
            </button>

            <button
              type="button"
              aria-label="Trend teilen"
              onClick={handleShare}
              onPointerDown={stopCardEvent}
              className="trend-card__action trend-card__action--icon"
            >
              <ShareIcon className="size-[18px]" aria-hidden />
            </button>
          </div>
        </div>
      </article>

      {!usesExternalAnalyse && (
        <Suspense fallback={<TrendDetailModalLoading />}>
          <TrendDetailModal
            trend={internalAnalyseOpen ? trend : null}
            onClose={() => setInternalAnalyseOpen(false)}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
          />
        </Suspense>
      )}
    </>
  )
}

function HookDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">{value}</p>
    </div>
  )
}

export const TrendCard = memo(TrendCardComponent, (prev, next) => {
  return (
    prev.trend.id === next.trend.id &&
    prev.trend.videoUrl === next.trend.videoUrl &&
    prev.trend.thumbnailUrl === next.trend.thumbnailUrl &&
    prev.priority === next.priority &&
    prev.feedIndex === next.feedIndex &&
    prev.preloadTier === next.preloadTier &&
    prev.isSaved === next.isSaved &&
    prev.onToggleSave === next.onToggleSave &&
    prev.onClick === next.onClick &&
    prev.onOpenAnalyse === next.onOpenAnalyse
  )
})
