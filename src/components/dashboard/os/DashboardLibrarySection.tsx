import { Badge } from '@/components/ui/Badge'
import { DashboardCarousel, DashboardCarouselItem } from '@/components/dashboard/os/DashboardCarousel'
import { DashboardSubsectionHeader } from '@/components/dashboard/os/DashboardSubsectionHeader'
import { SafeMediaThumb } from '@/components/dashboard/os/SafeMediaThumb'
import {
  BookmarkIcon,
  ClapperboardIcon,
  FilmStripIcon,
  PlayIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import type { SavedAiVideo } from '@/types/ai-video-library'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import type { DashboardRouteId } from '@/lib/routes'
import { formatVideoDate } from '@/lib/my-videos-api'
import { cn } from '@/lib'

type DashboardLibrarySectionProps = {
  videos: SavedAiVideo[]
  videosLoading: boolean
  onNavigate: (tool: DashboardRouteId) => void
}

function formatTrendSavedAt(iso?: string): string {
  if (!iso) return 'Recently'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days < 1) {
    return `Today · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getTrendTags(trend: TrendIntelligence): string[] {
  const tags: string[] = []
  if (trend.niche) tags.push(trend.niche)
  for (const tag of trend.hashtags.slice(0, 3)) {
    const clean = tag.replace(/^#/, '')
    if (clean && !tags.includes(clean)) tags.push(clean)
  }
  return tags.slice(0, 3)
}

function SavedTrendIntelCard({
  trend,
  onClick,
}: {
  trend: TrendIntelligence
  onClick: () => void
}) {
  const tags = getTrendTags(trend)

  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-os-trend-card group w-full text-left"
    >
      <div className="dashboard-os-trend-card__inner flex items-center gap-2.5 rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-2 backdrop-blur-sm transition-smooth sm:gap-3">
        <div className="relative size-[3.25rem] shrink-0 overflow-hidden rounded-lg border border-zinc-800/80 sm:size-14">
          <SafeMediaThumb
            src={trend.thumbnailUrl}
            variant="trend"
            fallbackClassName={cn('bg-gradient-to-br', trend.gradientFrom, trend.gradientTo)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute left-1 top-1 rounded border border-emerald-500/30 bg-emerald-500/15 px-1 py-px text-[9px] font-bold tabular-nums text-emerald-300 backdrop-blur-sm">
            {trend.viralScore}
          </span>
          <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-px text-[7px] font-bold uppercase tracking-wide text-zinc-300">
            {trend.platform}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-zinc-50">
            {trend.title}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-500">{formatTrendSavedAt(trend.savedAt)}</p>
          {tags.length > 0 ? (
            <ul className="mt-1.5 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-px text-[9px] font-medium capitalize text-violet-200/90"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 self-stretch py-0.5">
          <BookmarkIcon
            className="size-3.5 text-violet-500/50 transition-smooth group-hover:text-violet-300"
            aria-hidden
          />
          <span
            className="text-sm text-zinc-600 transition-smooth group-hover:translate-x-0.5 group-hover:text-zinc-400"
            aria-hidden
          >
            ›
          </span>
        </div>
      </div>
    </button>
  )
}

function statusVariant(
  status: SavedAiVideo['status'],
): 'success' | 'default' | 'warning' {
  if (status === 'completed') return 'success'
  if (status === 'generating' || status === 'processing') return 'warning'
  return 'default'
}

function statusLabel(status: SavedAiVideo['status']): string {
  if (status === 'completed') return 'Completed'
  if (status === 'generating' || status === 'processing') return 'Rendering'
  if (status === 'queued') return 'Queued'
  if (status === 'failed') return 'Failed'
  return status
}

function ReelVideoCard({
  video,
  onClick,
}: {
  video: SavedAiVideo
  onClick: () => void
}) {
  const canPlay = video.status === 'completed' && Boolean(video.videoUrl)

  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-os-video-card group w-full min-w-0 text-left"
    >
      <div className="dashboard-os-video-card__shell overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/50 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.65)] transition-smooth">
        <div className="dashboard-os-video-card__thumb relative aspect-[4/5] overflow-hidden">
          <div className="size-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <SafeMediaThumb src={video.posterUrl} variant="video" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/10 to-zinc-950/30" />

          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
            <Badge variant={statusVariant(video.status)} className="text-[8px] font-semibold uppercase">
              {statusLabel(video.status)}
            </Badge>
            <span className="inline-flex w-fit items-center gap-0.5 rounded border border-violet-500/25 bg-violet-500/10 px-1 py-px text-[7px] font-semibold uppercase text-violet-200/90">
              <SparklesIcon className="size-2.5" aria-hidden />
              AI
            </span>
          </div>

          {video.platform ? (
            <span className="absolute right-1.5 top-1.5 rounded border border-white/10 bg-black/55 px-1.5 py-px text-[8px] font-bold uppercase text-zinc-200 backdrop-blur-sm">
              {video.platform}
            </span>
          ) : null}

          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-px text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {video.duration}
          </span>

          {canPlay && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md">
                <PlayIcon className="ml-0.5 size-4 text-white" />
              </span>
            </span>
          )}
        </div>

        <div className="border-t border-zinc-800/60 px-2 py-2">
          <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-zinc-100">
            {video.title}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-zinc-500">
            {formatVideoDate(video.createdAt)}
          </p>
        </div>
      </div>
    </button>
  )
}

function VideoRowSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCarouselItem key={i} variant="media">
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
        </DashboardCarouselItem>
      ))}
    </>
  )
}

export function DashboardLibrarySection({
  videos,
  videosLoading,
  onNavigate,
}: DashboardLibrarySectionProps) {
  const { savedTrends } = useSavedTrends()
  const trendPreview = savedTrends.slice(0, 5)
  const videoPreview = videos.slice(0, 10)

  return (
    <section className="dashboard-os-section dashboard-os-section--embedded dashboard-os-library">
      <div className="dashboard-os-feed-block">
        <DashboardSubsectionHeader
          title="Saved Trends"
          count={savedTrends.length}
          icon={BookmarkIcon}
          onViewAll={() => onNavigate('saved-trends')}
        />
        {trendPreview.length === 0 ? (
          <button
            type="button"
            onClick={() => onNavigate('trend-intelligence')}
            className="dashboard-os-empty-cta flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800/70 bg-zinc-900/25 px-3 py-5 text-xs text-zinc-500 transition-smooth hover:border-violet-500/25 hover:text-zinc-300"
          >
            <TrendingUpIcon className="size-4 text-violet-500/60" />
            Save your first trend
          </button>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {trendPreview.map((trend) => (
              <li key={trend.id}>
                <SavedTrendIntelCard trend={trend} onClick={() => onNavigate('saved-trends')} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-os-feed-block dashboard-os-feed-block--videos">
        <DashboardSubsectionHeader
          title="My AI Videos"
          count={videos.length}
          icon={FilmStripIcon}
          onViewAll={() => onNavigate('my-videos')}
        />
        {videosLoading ? (
          <div className="dashboard-os-carousel-fade">
            <DashboardCarousel className="dashboard-os-video-carousel">
              <VideoRowSkeleton />
            </DashboardCarousel>
          </div>
        ) : videoPreview.length === 0 ? (
          <button
            type="button"
            onClick={() => onNavigate('ai-studio')}
            className="dashboard-os-empty-cta flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800/70 bg-zinc-900/25 px-3 py-5 text-xs text-zinc-500 transition-smooth hover:border-fuchsia-500/25 hover:text-zinc-300"
          >
            <ClapperboardIcon className="size-4 text-fuchsia-500/60" />
            Generate your first reel
          </button>
        ) : (
          <div className="dashboard-os-carousel-fade">
            <DashboardCarousel className="dashboard-os-video-carousel">
              {videoPreview.map((video) => (
                <DashboardCarouselItem key={video.id} variant="media">
                  <ReelVideoCard video={video} onClick={() => onNavigate('my-videos')} />
                </DashboardCarouselItem>
              ))}
            </DashboardCarousel>
          </div>
        )}
      </div>
    </section>
  )
}
