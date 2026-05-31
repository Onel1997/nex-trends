import { useState } from 'react'
import { AiStudioEmptyIllustration } from '@/components/ai-studio/AiStudioEmptyIllustration'
import { navigateToTool } from '@/lib/navigation'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import {
  VideoLibraryCard,
  VideoLibraryFilters,
  VideoPlaybackModal,
} from '@/components/my-videos'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilmStripIcon, SparklesIcon } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMyAiVideos } from '@/hooks/useMyAiVideos'
import type { SavedAiVideo } from '@/types/ai-video-library'

function VideoCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="relative aspect-[9/16] w-full overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function MyAiVideosPage() {
  const {
    videos,
    loading,
    error,
    platformFilter,
    statusFilter,
    setPlatformFilter,
    setStatusFilter,
    refresh,
    remove,
    regenerate,
    deletingId,
    regeneratingId,
  } = useMyAiVideos()

  const [playbackVideo, setPlaybackVideo] = useState<SavedAiVideo | null>(null)

  return (
    <div className="studio-page mx-auto max-w-6xl space-y-6 px-1 pb-8 animate-fade-in sm:space-y-8 sm:px-0 sm:pb-10">
      <header className="relative space-y-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <FilmStripIcon className="size-3.5 text-violet-400" aria-hidden />
          Creator Studio
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="gradient-accent-text">My AI Videos</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Alle generierten Shorts — gespeichert mit voller Wiedergabe, Download und
              Regenerierung.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refresh()}
            className="btn-press shrink-0 self-start sm:self-auto"
          >
            Aktualisieren
          </Button>
        </div>
      </header>

      <div className="glass-subtle rounded-2xl border border-violet-500/10 p-3 sm:p-5">
        <VideoLibraryFilters
          platform={platformFilter}
          status={statusFilter}
          onPlatformChange={setPlatformFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {error && <ErrorBanner error={error} onRetry={() => void refresh()} />}

      {loading && videos.length === 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <VideoCardSkeleton />
            </li>
          ))}
        </ul>
      ) : videos.length === 0 ? (
        <EmptyState
          variant="premium"
          title="No AI videos yet"
          description="Generate your first viral short in AI Video Studio — it will appear here ready to play, download, or regenerate."
          illustration={<AiStudioEmptyIllustration className="mx-auto w-full" />}
          action={
            <Button
              variant="pro"
              size="md"
              className="btn-glow-pro btn-press shadow-[0_0_36px_-8px_rgba(139,92,246,0.55)]"
              onClick={() => navigateToTool('ai-studio')}
            >
              <SparklesIcon className="size-4" />
              Generate your first AI video
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video, i) => (
            <li
              key={video.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <VideoLibraryCard
                video={video}
                onPlay={setPlaybackVideo}
                onDelete={(v) => void remove(v)}
                onRegenerate={(v) => void regenerate(v)}
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
    </div>
  )
}
