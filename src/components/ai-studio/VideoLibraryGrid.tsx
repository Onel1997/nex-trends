import {
  VideoLibraryCard,
  VideoPlaybackModal,
} from '@/components/my-videos'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilmStripIcon } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib'
import type { SavedAiVideo } from '@/types/ai-video-library'
import { useState } from 'react'

function VideoCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="aspect-[9/16] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </div>
    </div>
  )
}

type VideoLibraryGridProps = {
  videos: SavedAiVideo[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onViewAll?: () => void
  onDelete: (video: SavedAiVideo) => void
  onRegenerate: (video: SavedAiVideo) => void
  deletingId?: string | null
  regeneratingId?: string | null
  limit?: number
  title?: string
  className?: string
}

export function VideoLibraryGrid({
  videos,
  loading,
  error,
  onRefresh,
  onViewAll,
  onDelete,
  onRegenerate,
  deletingId,
  regeneratingId,
  limit,
  title = 'Generated videos',
  className,
}: VideoLibraryGridProps) {
  const [playbackVideo, setPlaybackVideo] = useState<SavedAiVideo | null>(null)
  const display = limit ? videos.slice(0, limit) : videos

  return (
    <section className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {videos.length} video{videos.length === 1 ? '' : 's'} in your library
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh ? (
            <Button variant="secondary" size="sm" onClick={() => void onRefresh()}>
              Refresh
            </Button>
          ) : null}
          {onViewAll && videos.length > (limit ?? 0) ? (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View all
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      {loading && videos.length === 0 ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <VideoCardSkeleton />
            </li>
          ))}
        </ul>
      ) : display.length === 0 ? (
        <EmptyState
          title="No AI videos yet"
          description="Generate your first viral short above — it will appear here with play, download, and regenerate actions."
          icon={<FilmStripIcon className="size-6 text-violet-400/80" />}
          size="compact"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {display.map((video, i) => (
            <li
              key={video.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <VideoLibraryCard
                video={video}
                onPlay={setPlaybackVideo}
                onDelete={onDelete}
                onRegenerate={onRegenerate}
                isDeleting={deletingId === video.id}
                isRegenerating={regeneratingId === video.id}
              />
            </li>
          ))}
        </ul>
      )}

      <VideoPlaybackModal
        video={playbackVideo}
        onClose={() => setPlaybackVideo(null)}
      />
    </section>
  )
}
