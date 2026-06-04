import {
  VideoLibraryCard,
  VideoPlaybackModal,
} from '@/components/my-videos'
import { AiStudioEmptyIllustration } from '@/components/ai-studio/AiStudioEmptyIllustration'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SparklesIcon } from '@/components/ui/icons'
import { VideoCardSkeleton } from '@/components/ui/Skeleton'
import { navigateToTool } from '@/lib/navigation'
import { cn } from '@/lib'
import type { SavedAiVideo } from '@/types/ai-video-library'
import { useState } from 'react'

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
  showEmptyCta?: boolean
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
  showEmptyCta = true,
}: VideoLibraryGridProps) {
  const [playbackVideo, setPlaybackVideo] = useState<SavedAiVideo | null>(null)
  const display = limit ? videos.slice(0, limit) : videos

  return (
    <section className={cn('space-y-5 sm:space-y-6', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {videos.length} video{videos.length === 1 ? '' : 's'} in your library
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void onRefresh()}
              className="btn-press"
            >
              Refresh
            </Button>
          ) : null}
          {onViewAll && videos.length > (limit ?? 0) ? (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="btn-press">
              View all
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="animate-fade-in rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      {loading && videos.length === 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
          variant="premium"
          title="No AI videos yet"
          description="Your generated shorts will appear here with play, download, and regenerate — start with your first cinematic AI video."
          illustration={<AiStudioEmptyIllustration className="mx-auto w-full" />}
          action={
            showEmptyCta ? (
              <Button
                variant="pro"
                size="md"
                onClick={() => {
                  const form = document.getElementById('ai-studio-form')
                  if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    return
                  }
                  navigateToTool('ai-studio')
                }}
              >
                <SparklesIcon className="size-4" />
                Generate your first AI video
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
