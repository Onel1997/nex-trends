import { Badge } from '@/components/ui/Badge'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
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
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function TrendLibraryCard({
  trend,
  onClick,
}: {
  trend: TrendIntelligence
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-os-library-card group w-[10.5rem] shrink-0 sm:w-[11.5rem]"
    >
      <div className="relative aspect-[9/14] overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/60 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.6)]">
        <div className="size-full transition-transform duration-500 group-hover:scale-[1.04]">
          <SafeMediaThumb
            src={trend.thumbnailUrl}
            variant="trend"
            fallbackClassName={cn('bg-gradient-to-br', trend.gradientFrom, trend.gradientTo)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <span className="absolute left-2 top-2 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold tabular-nums text-emerald-300 shadow-lg">
          {trend.viralScore}
        </span>
        <span className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-200 backdrop-blur-sm">
          {trend.platform}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">
            {trend.title}
          </p>
          <p className="mt-1 text-[10px] text-zinc-400">
            {formatTrendSavedAt(trend.savedAt)}
          </p>
        </div>
      </div>
    </button>
  )
}

function VideoLibraryCard({
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
      className="dashboard-os-library-card group w-[10.5rem] shrink-0 sm:w-[11.5rem]"
    >
      <div className="relative aspect-[9/14] overflow-hidden rounded-2xl border border-violet-500/25 bg-zinc-900/60 shadow-[0_8px_32px_-16px_rgba(139,92,246,0.25)]">
        <div className="size-full transition-transform duration-500 group-hover:scale-[1.04]">
          <SafeMediaThumb src={video.posterUrl} variant="video" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
        {canPlay && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex size-10 items-center justify-center rounded-full bg-violet-600/85 ring-2 ring-violet-400/40">
              <PlayIcon className="ml-0.5 size-4 text-white" />
            </span>
          </span>
        )}
        <Badge variant={video.status === 'completed' ? 'success' : 'default'} className="absolute left-2 top-2 text-[9px] capitalize">
          {video.status}
        </Badge>
        {video.platform && (
          <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-200 backdrop-blur-md">
            {video.platform}
          </span>
        )}
        <span className="absolute bottom-12 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white backdrop-blur-md">
          {video.duration}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">
            {video.title}
          </p>
          <p className="mt-1 text-[10px] text-zinc-400">{formatVideoDate(video.createdAt)}</p>
        </div>
      </div>
    </button>
  )
}

function LibraryRowSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[14.5rem] w-[10.5rem] shrink-0 rounded-2xl sm:w-[11.5rem]" />
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
  const trendPreview = savedTrends.slice(0, 8)
  const videoPreview = videos.slice(0, 8)

  return (
    <section className="animate-fade-in animation-delay-300 space-y-8">
      <DashboardSectionHeading
        title="Creator Library"
        description="Your saved trends and AI video reels — cinematic previews, ready to ship."
      />
      <div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2">
              <BookmarkIcon className="size-4 text-violet-400/80" />
              <h3 className="text-sm font-semibold text-zinc-200">Saved Trends</h3>
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
                {savedTrends.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('saved-trends')}
              className="text-xs font-medium text-violet-400 transition-smooth hover:text-violet-300"
            >
              View all →
            </button>
          </div>

          {trendPreview.length === 0 ? (
            <button
              type="button"
              onClick={() => onNavigate('trend-intelligence')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-900/20 px-4 py-10 text-sm text-zinc-500 transition-smooth hover:border-violet-500/30 hover:text-zinc-300"
            >
              <TrendingUpIcon className="size-5 text-violet-500/60" />
              Save your first trend →
            </button>
          ) : (
            <div className="dashboard-os-scroll dashboard-os-scroll--snap -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
              {trendPreview.map((trend) => (
                <TrendLibraryCard
                  key={trend.id}
                  trend={trend}
                  onClick={() => onNavigate('saved-trends')}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2">
              <FilmStripIcon className="size-4 text-fuchsia-400/80" />
              <h3 className="text-sm font-semibold text-zinc-200">My AI Videos</h3>
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
                {videos.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-videos')}
              className="text-xs font-medium text-violet-400 transition-smooth hover:text-violet-300"
            >
              View all →
            </button>
          </div>

          {videosLoading ? (
            <div className="dashboard-os-scroll dashboard-os-scroll--snap -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
              <LibraryRowSkeleton />
            </div>
          ) : videoPreview.length === 0 ? (
            <button
              type="button"
              onClick={() => onNavigate('ai-studio')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-900/20 px-4 py-10 text-sm text-zinc-500 transition-smooth hover:border-fuchsia-500/30 hover:text-zinc-300"
            >
              <ClapperboardIcon className="size-5 text-fuchsia-500/60" />
              Generate your first AI video →
            </button>
          ) : (
            <div className="dashboard-os-scroll dashboard-os-scroll--snap -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
              {videoPreview.map((video) => (
                <VideoLibraryCard
                  key={video.id}
                  video={video}
                  onClick={() => onNavigate('my-videos')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
