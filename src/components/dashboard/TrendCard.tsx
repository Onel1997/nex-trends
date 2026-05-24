import { cn } from '@/lib'
import { VideoPreview } from '@/components/dashboard/VideoPreview'
import {
  EyeIcon,
  HeartIcon,
  SparklesIcon,
  VerifiedIcon,
} from '@/components/ui/icons'
import {
  getViralScoreTone,
  VELOCITY_META,
} from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type DisplayTrend = TrendIntelligence

type TrendCardProps = {
  trend: TrendIntelligence
  onClick?: () => void
  priority?: boolean
}

function ViralScoreRing({ score }: { score: number }) {
  const tone = getViralScoreTone(score)
  const circumference = 2 * Math.PI * 16
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex size-9 shrink-0 items-center justify-center">
      <svg className="size-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          strokeWidth="2.5"
          className="stroke-black/40"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={cn('transition-all duration-700', tone.ringClass)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn('absolute text-[10px] font-bold tabular-nums text-white', tone.textClass)}>
        {score}
      </span>
    </div>
  )
}

export function TrendCard({ trend, onClick, priority = false }: TrendCardProps) {
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')
  const velocity = VELOCITY_META[trend.trendVelocity]
  const scoreTone = getViralScoreTone(trend.viralScore)

  return (
    <article
      className={cn(
        'trend-card group relative flex flex-col overflow-hidden rounded-2xl',
        'border border-zinc-800/60 bg-zinc-900/40',
        'shadow-sm transition-smooth',
        'hover:-translate-y-1 hover:border-zinc-700/80 hover:shadow-2xl hover:shadow-violet-950/20',
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
      <div className="relative">
        <VideoPreview
          thumbnailUrl={trend.thumbnailUrl}
          videoUrl={trend.videoUrl}
          alt={trend.title}
          duration={trend.videoDuration}
          aspectClass="aspect-[9/14] sm:aspect-[9/15]"
          priority={priority}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md',
                isTikTok
                  ? 'bg-black/70 text-white ring-1 ring-white/20'
                  : 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white',
              )}
            >
              {trend.platform}
            </span>
            {trend.isDemo && (
              <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 backdrop-blur-sm">
                Demo
              </span>
            )}
          </div>
          <ViralScoreRing score={trend.viralScore} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-center gap-2">
            <img
              src={trend.creator.avatarUrl}
              alt=""
              className="size-7 rounded-full object-cover ring-2 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-0.5 truncate text-xs font-semibold text-white drop-shadow-sm">
                {trend.creator.handle}
                {trend.creator.verified && (
                  <VerifiedIcon className="size-3 shrink-0 text-sky-300" aria-hidden />
                )}
              </p>
              <p className="text-[10px] text-white/70">{trend.creator.followers}</p>
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

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white">
          {trend.title}
        </h3>

        <div className="flex items-center gap-3 text-[11px] tabular-nums text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <EyeIcon className="size-3.5 text-zinc-500" aria-hidden />
            {trend.views}
          </span>
          <span className="inline-flex items-center gap-1">
            <HeartIcon className="size-3.5 text-rose-400/80" aria-hidden />
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
              className="rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-medium text-violet-300/90 ring-1 ring-zinc-800/60"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
          {trend.hashtags.length > 3 && (
            <span className="px-1 text-[10px] text-zinc-600">+{trend.hashtags.length - 3}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-400/80">
              Hook
            </p>
            <p className="truncate text-[11px] text-zinc-400">
              {trend.hookAnalysis.hookText}
            </p>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1 text-[10px] font-medium text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">
            <SparklesIcon className="size-3 text-violet-400" aria-hidden />
            Details
          </div>
        </div>
      </div>
    </article>
  )
}

