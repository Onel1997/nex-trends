import { Badge } from '@/components/ui/Badge'
import { DashboardCarousel, DashboardCarouselItem } from '@/components/dashboard/os/DashboardCarousel'
import { DashboardSubsectionHeader } from '@/components/dashboard/os/DashboardSubsectionHeader'
import { SafeMediaThumb } from '@/components/dashboard/os/SafeMediaThumb'
import {
  BookmarkIcon,
  ClapperboardIcon,
  FilmStripIcon,
  PlayIcon,
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
  if (days < 1) return `Today · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
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
  return tags.slice(0, 4)
}

function SavedTrendRowCard({
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
      className="dashboard-os-trend-row dashboard-os-card group w-full max-w-full text-left"
    >
      <div className="glass-premium flex w-full items-center gap-3 rounded-2xl border border-zinc-800/55 p-2.5 transition-smooth sm:gap-3.5 sm:p-3">
        <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-xl border border-zinc-700/60 sm:size-[4.75rem]">
          <SafeMediaThumb
            src={trend.thumbnailUrl}
            variant="trend"
            fallbackClassName={cn('bg-gradient-to-br', trend.gradientFrom, trend.gradientTo)}
          />
          <span className="absolute left-1 top-1 rounded-md border border-emerald-500/40 bg-emerald-500/25 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-emerald-100 backdrop-blur-sm">
            {trend.viralScore}
          </span>
          <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-zinc-200 backdrop-blur-sm">
            {trend.platform}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{trend.title}</p>
          <p className="dashboard-os-muted mt-0.5 text-[11px]">{formatTrendSavedAt(trend.savedAt)}</p>
          {tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-medium capitalize text-violet-200/90"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-2 self-stretch py-0.5">
          <BookmarkIcon
            className="size-4 text-violet-400/70 transition-smooth group-hover:text-violet-300"
            aria-hidden
          />
          <span
            className="text-zinc-600 transition-smooth group-hover:translate-x-0.5 group-hover:text-violet-400"
            aria-hidden
          >
            ›
          </span>
        </div>
      </div>
    </button>
  )
}

function CinematicVideoCard({
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
      className="dashboard-os-video-card dashboard-os-card group w-full max-w-full min-w-0 text-left"
    >
      <div className="overflow-hidden rounded-2xl border border-violet-500/25 bg-zinc-900/50 transition-smooth group-hover:border-violet-500/40">
        <div className="dashboard-os-video-card__thumb relative aspect-[4/5] overflow-hidden sm:aspect-[9/14]">
          <div className="size-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
            <SafeMediaThumb src={video.posterUrl} variant="video" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <Badge
            variant={video.status === 'completed' ? 'success' : 'default'}
            className="absolute left-2 top-2 text-[9px] capitalize shadow-md"
          >
            {video.status}
          </Badge>
          {video.platform && (
            <span className="absolute right-2 top-2 rounded-md border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-100 backdrop-blur-md">
              {video.platform}
            </span>
          )}
          {canPlay && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex size-10 items-center justify-center rounded-full bg-violet-600/90 shadow-[0_0_20px_rgba(139,92,246,0.6)] ring-2 ring-violet-400/40">
                <PlayIcon className="ml-0.5 size-4 text-white" />
              </span>
            </span>
          )}
          <span className="absolute bottom-2 right-2 rounded-md border border-white/10 bg-black/75 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white backdrop-blur-md">
            {video.duration}
          </span>
        </div>
        <div className="border-t border-zinc-800/50 bg-zinc-950/40 px-3 py-2.5">
          <p className="line-clamp-1 text-xs font-semibold text-white">{video.title}</p>
          <p className="dashboard-os-muted mt-0.5 text-[10px]">{formatVideoDate(video.createdAt)}</p>
        </div>
      </div>
    </button>
  )
}

function VideoRowSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <DashboardCarouselItem key={i} variant="media">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl sm:aspect-[9/14]" />
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
  const videoPreview = videos.slice(0, 8)

  return (
    <section className="dashboard-os-section dashboard-os-library animate-fade-in animation-delay-300 space-y-6 sm:space-y-7">
      <div>
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
            className="dashboard-os-empty-cta flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/25 px-4 py-8 text-sm text-zinc-400 transition-smooth hover:border-violet-500/35 hover:text-zinc-200"
          >
            <TrendingUpIcon className="size-5 text-violet-500/70" />
            Save your first trend →
          </button>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {trendPreview.map((trend) => (
              <li key={trend.id}>
                <SavedTrendRowCard trend={trend} onClick={() => onNavigate('saved-trends')} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <DashboardSubsectionHeader
          title="My AI Videos"
          count={videos.length}
          icon={FilmStripIcon}
          iconClassName="text-fuchsia-400/90"
          onViewAll={() => onNavigate('my-videos')}
        />
        {videosLoading ? (
          <DashboardCarousel>
            <VideoRowSkeleton />
          </DashboardCarousel>
        ) : videoPreview.length === 0 ? (
          <button
            type="button"
            onClick={() => onNavigate('ai-studio')}
            className="dashboard-os-empty-cta flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700/60 bg-zinc-900/25 px-4 py-8 text-sm text-zinc-400 transition-smooth hover:border-fuchsia-500/35 hover:text-zinc-200"
          >
            <ClapperboardIcon className="size-5 text-fuchsia-500/70" />
            Generate your first AI video →
          </button>
        ) : (
          <DashboardCarousel>
            {videoPreview.map((video) => (
              <DashboardCarouselItem key={video.id} variant="media">
                <CinematicVideoCard video={video} onClick={() => onNavigate('my-videos')} />
              </DashboardCarouselItem>
            ))}
          </DashboardCarousel>
        )}
      </div>
    </section>
  )
}
