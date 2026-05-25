import { useState } from 'react'
import { navigateToTool } from '@/lib/navigation'
import {
  VideoLibraryCard,
  VideoLibraryFilters,
  VideoPlaybackModal,
} from '@/components/my-videos'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilmStripIcon } from '@/components/ui/icons'
import { Spinner } from '@/components/ui/Spinner'
import { useMyAiVideos } from '@/hooks/useMyAiVideos'
import type { SavedAiVideo } from '@/types/ai-video-library'

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
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <header className="space-y-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <FilmStripIcon className="size-3.5 text-violet-400" aria-hidden />
          Creator Studio
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="gradient-accent-text">My AI Videos</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Alle generierten Shorts aus Supabase — gespeichert im{' '}
              <span className="text-zinc-400">ai-videos</span> Bucket mit voller
              Wiedergabe, Download und Regenerierung.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refresh()}>
            Aktualisieren
          </Button>
        </div>
      </header>

      <div className="glass-subtle rounded-2xl border border-violet-500/10 p-4 sm:p-5">
        <VideoLibraryFilters
          platform={platformFilter}
          status={statusFilter}
          onPlatformChange={setPlatformFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      )}

      {loading && videos.length === 0 ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" label="AI Videos werden geladen …" />
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          title="No AI videos yet"
          description="Generate your first viral short in AI Video Studio — it will appear here with play, download, and regenerate."
          icon={<FilmStripIcon className="size-6 text-violet-400/80" />}
          action={
            <Button variant="pro" size="md" onClick={() => navigateToTool('ai-studio')}>
              Open AI Video Studio
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <li key={video.id}>
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
