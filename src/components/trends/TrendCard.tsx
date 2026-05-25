import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib'
import { VideoPreview } from '@/components/trends/VideoPreview'
import { pickNextFallbackMedia } from '@/lib/trend-media-assignment'
import { TrendMetricsStrip } from '@/components/trends/TrendMetricsStrip'
import { ViralScoreRing } from '@/components/trends/ViralScoreRing'
import {
  EyeIcon,
  HeartIcon,
  SparklesIcon,
  VerifiedIcon,
} from '@/components/ui/icons'
import { getViralScoreTone, VELOCITY_META } from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type DisplayTrend = TrendIntelligence

type TrendCardProps = {
  trend: TrendIntelligence
  onClick?: () => void
  priority?: boolean
  isSaved?: boolean
  /** Other cards' video URLs — avoids failover picking a duplicate in the feed */
  feedVideoUrls?: readonly string[]
}

function TrendCardComponent({
  trend,
  onClick,
  priority = false,
  isSaved,
  feedVideoUrls = [],
}: TrendCardProps) {
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')
  const velocity = VELOCITY_META[trend.trendVelocity]
  const scoreTone = getViralScoreTone(trend.viralScore)
  const failedVideosRef = useRef(new Set<string>())
  const [media, setMedia] = useState({
    videoUrl: trend.videoUrl,
    thumbnailUrl: trend.thumbnailUrl,
    videoDuration: trend.videoDuration,
  })

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
  }, [trend.id, media.videoUrl, feedVideoUrls])

  return (
    <article
      className={cn(
        'trend-card group relative flex flex-col overflow-hidden rounded-2xl',
        'border border-zinc-800/50 bg-zinc-900/30',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_4px_24px_-8px_rgba(0,0,0,0.4)]',
        'transition-smooth touch-manipulation',
        'hover:-translate-y-0.5 hover:border-zinc-700/60 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]',
        'active:scale-[0.985] active:opacity-95 sm:active:scale-100 sm:active:opacity-100',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${trend.title} — Details anzeigen` : undefined}
    >
      <div className="relative min-h-[280px] sm:min-h-[300px]">
        <VideoPreview
          playbackId={trend.id}
          variant="card"
          thumbnailUrl={media.thumbnailUrl}
          videoUrl={media.videoUrl}
          alt={trend.title}
          duration={media.videoDuration}
          aspectClass="aspect-[9/16] w-full sm:aspect-[9/15]"
          priority={priority}
          onVideoUnavailable={handleVideoUnavailable}
        />

        {onClick && (
          <div
            aria-hidden
            className="absolute inset-0 z-[5] cursor-pointer sm:hidden"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md',
                isTikTok
                  ? 'bg-black/60 text-white ring-1 ring-white/10'
                  : 'bg-violet-600/80 text-white',
              )}
            >
              {trend.platform}
            </span>
            {trend.isDemo && (
              <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 backdrop-blur-sm">
                Demo
              </span>
            )}
            {isSaved && (
              <span className="rounded-full bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-medium text-violet-200 backdrop-blur-sm">
                ★
              </span>
            )}
          </div>
          <ViralScoreRing score={trend.viralScore} size="sm" animate={priority} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-8">
          <div className="flex items-center gap-2">
            <img
              src={trend.creator.avatarUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-7 rounded-full object-cover ring-2 ring-white/15"
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
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset backdrop-blur-sm',
                velocity.className,
              )}
            >
              {velocity.icon} {velocity.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:gap-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white">
          {trend.title}
        </h3>

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

        <div className="mt-auto flex items-center justify-between rounded-xl border border-zinc-800/40 bg-zinc-950/40 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
              Hook
            </p>
            <p className="truncate text-[11px] text-zinc-400">
              {trend.hookAnalysis.hookText}
            </p>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1 text-[10px] font-medium text-zinc-500 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <SparklesIcon className="size-3 text-violet-400/80" aria-hidden />
            Details
          </div>
        </div>
      </div>
    </article>
  )
}

export const TrendCard = memo(TrendCardComponent, (prev, next) => {
  return (
    prev.trend.id === next.trend.id &&
    prev.priority === next.priority &&
    prev.isSaved === next.isSaved &&
    prev.onClick === next.onClick
  )
})
