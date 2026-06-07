import { DashboardCarousel, DashboardCarouselItem } from '@/components/dashboard/os/DashboardCarousel'
import { DashboardEmptyIllustration } from '@/components/dashboard/os/DashboardEmptyIllustration'
import { DashboardOnboardingEmpty } from '@/components/dashboard/os/DashboardOnboardingEmpty'
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
  for (const tag of trend.hashtags.slice(0, 2)) {
    const clean = tag.replace(/^#/, '')
    if (clean && !tags.includes(clean)) tags.push(clean)
  }
  return tags.slice(0, 2)
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
      <div className="dashboard-os-trend-card__inner dashboard-os-surface overflow-hidden backdrop-blur-md transition-smooth">
        <div className="flex items-center gap-2.5 p-2.5">
          <div className="dashboard-os-trend-card__thumb relative size-12 shrink-0 overflow-hidden rounded-[calc(var(--dash-radius)-2px)] border border-zinc-800/55">
            <SafeMediaThumb
              src={trend.thumbnailUrl}
              variant="trend"
              fallbackClassName={cn('bg-gradient-to-br', trend.gradientFrom, trend.gradientTo)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="dashboard-os-chip absolute left-1 top-1 px-1 py-px text-[8px] font-bold tabular-nums text-emerald-300">
              {trend.viralScore}
            </span>
            <span className="dashboard-os-chip absolute bottom-1 left-1 px-1 py-px text-[7px] font-bold uppercase text-zinc-400">
              {trend.platform}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-zinc-100">{trend.title}</p>
            <p className="mt-0.5 text-[9px] text-zinc-500">{formatTrendSavedAt(trend.savedAt)}</p>
            {tags.length > 0 ? (
              <ul className="mt-1.5 flex flex-wrap gap-0.5">
                {tags.map((tag) => (
                  <li key={tag} className="dashboard-os-tag capitalize">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <span
            className="shrink-0 text-zinc-600 transition-smooth group-hover:text-zinc-400"
            aria-hidden
          >
            ›
          </span>
        </div>
      </div>
    </button>
  )
}

function videoStatusTone(status: SavedAiVideo['status']): 'ready' | 'active' | 'muted' {
  if (status === 'completed') return 'ready'
  if (status === 'generating' || status === 'processing' || status === 'queued') return 'active'
  return 'muted'
}

function statusLabel(status: SavedAiVideo['status']): string {
  if (status === 'completed') return 'Ready'
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
  const tone = videoStatusTone(video.status)

  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-os-video-card group w-full min-w-0 text-left"
    >
      <div className="dashboard-os-video-card__shell dashboard-os-reel-card overflow-hidden rounded-[var(--dash-radius)]">
        <div className="dashboard-os-video-card__thumb relative aspect-[2/3] overflow-hidden bg-zinc-950">
          <div className="size-full transition-transform duration-500 ease-out group-hover:scale-[1.03] group-active:scale-[1.01]">
            <SafeMediaThumb src={video.posterUrl} variant="video" />
          </div>
          <div className="dashboard-os-reel-card__scrim pointer-events-none absolute inset-0" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
            <span
              className={cn(
                'dashboard-os-status-badge',
                tone === 'ready' && 'dashboard-os-status-badge--ready',
                tone === 'active' && 'dashboard-os-status-badge--active',
                tone === 'muted' && 'dashboard-os-status-badge--muted',
              )}
            >
              {statusLabel(video.status)}
            </span>
            {video.platform ? (
              <span className="dashboard-os-chip px-1.5 py-px text-[7px] font-semibold uppercase text-zinc-300">
                {video.platform}
              </span>
            ) : null}
          </div>

          {canPlay && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="dashboard-os-reel-card__play flex size-9 items-center justify-center rounded-full">
                <PlayIcon className="ml-0.5 size-4 text-white" />
              </span>
            </span>
          )}

          <div className="dashboard-os-reel-card__meta absolute inset-x-0 bottom-0 p-2 pt-8">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[8px] font-semibold uppercase tracking-wider text-violet-300/80">
                AI Studio
              </span>
              <span className="text-[10px] font-semibold tabular-nums text-white/90">
                {video.duration}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-1 text-[11px] font-semibold leading-tight text-zinc-50">
              {video.title}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-zinc-500">
              {formatVideoDate(video.createdAt)}
            </p>
          </div>
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
          <Skeleton className="aspect-[2/3] w-full rounded-[var(--dash-radius)]" />
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
          <DashboardOnboardingEmpty
            compact
            illustration={
              <DashboardEmptyIllustration variant="trends" className="mx-auto max-w-[130px]" />
            }
            title="Noch keine Trends"
            description="Speichere Trends aus Trend Intelligence — sie erscheinen hier."
            action={
              <button
                type="button"
                onClick={() => onNavigate('trend-intelligence')}
                className="dashboard-os-btn dashboard-os-btn-secondary inline-flex h-9 items-center gap-2 rounded-[var(--dash-radius)] px-4 text-[10px] touch-manipulation"
              >
                <TrendingUpIcon className="size-3.5 text-violet-400" aria-hidden />
                Ersten Trend speichern
              </button>
            }
            className="border border-dashed border-zinc-800/50"
          />
        ) : (
          <ul className="flex flex-col gap-1">
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
          <div className="dashboard-os-carousel-fade dashboard-os-video-rail">
            <DashboardCarousel className="dashboard-os-video-carousel">
              <VideoRowSkeleton />
            </DashboardCarousel>
          </div>
        ) : videoPreview.length === 0 ? (
          <DashboardOnboardingEmpty
            compact
            illustration={
              <DashboardEmptyIllustration variant="videos" className="mx-auto max-w-[130px]" />
            }
            title="Noch keine AI Videos"
            description="Erstelle dein erstes Reel im AI Studio — fertige Clips landen hier."
            action={
              <button
                type="button"
                onClick={() => onNavigate('ai-studio')}
                className="dashboard-os-btn dashboard-os-btn-primary inline-flex h-9 items-center gap-2 rounded-[var(--dash-radius)] px-4 text-[10px] touch-manipulation"
              >
                <ClapperboardIcon className="size-3.5" aria-hidden />
                Erstes Video generieren
              </button>
            }
            className="border border-dashed border-zinc-800/50"
          />
        ) : (
          <div className="dashboard-os-carousel-fade dashboard-os-video-rail">
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
