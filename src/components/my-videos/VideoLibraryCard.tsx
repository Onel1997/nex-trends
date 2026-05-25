import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  ArrowPathIcon,
  DownloadIcon,
  PlayIcon,
  TrashIcon,
} from '@/components/ui/icons'
import { SpinnerInline } from '@/components/ui/Spinner'
import { cn } from '@/lib'
import {
  downloadVideoMp4,
  formatVideoDate,
  statusBadgeVariant,
} from '@/lib/my-videos-api'
import type { SavedAiVideo } from '@/types/ai-video-library'

type VideoLibraryCardProps = {
  video: SavedAiVideo
  onPlay: (video: SavedAiVideo) => void
  onDelete: (video: SavedAiVideo) => void
  onRegenerate: (video: SavedAiVideo) => void
  isDeleting?: boolean
  isRegenerating?: boolean
}

export function VideoLibraryCard({
  video,
  onPlay,
  onDelete,
  onRegenerate,
  isDeleting,
  isRegenerating,
}: VideoLibraryCardProps) {
  const canPlay = video.status === 'completed' && Boolean(video.videoUrl)
  const canDownload = canPlay
  const canRegenerate = Boolean(video.jobId) && video.status === 'failed'

  return (
    <article
      className={cn(
        'ai-video-card group glass-card overflow-hidden transition-smooth duration-300',
        'hover:border-violet-500/35 hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.4)]',
      )}
    >
      <button
        type="button"
        disabled={!canPlay}
        onClick={() => canPlay && onPlay(video)}
        className={cn(
          'relative block w-full aspect-[9/16] overflow-hidden bg-zinc-900/90 text-left',
          canPlay && 'cursor-pointer',
          !canPlay && 'cursor-default opacity-85',
        )}
      >
        {video.posterUrl ? (
          <img
            src={video.posterUrl}
            alt=""
            width={360}
            height={640}
            decoding="async"
            className={cn(
              'ai-video-card__thumb absolute inset-0 size-full',
              'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'group-hover:scale-[1.04] group-active:scale-[1.02]',
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-950/80 via-zinc-900 to-fuchsia-950/60">
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              {video.status}
            </span>
          </div>
        )}

        <div className="ai-video-card__glass pointer-events-none absolute inset-0" aria-hidden />
        <div className="ai-video-card__fade pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" aria-hidden />

        {canPlay && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100',
            )}
          >
            <div
              className={cn(
                'flex size-14 items-center justify-center rounded-full',
                'bg-violet-600/85 ring-2 ring-violet-400/50 backdrop-blur-md',
                'shadow-[0_0_32px_-4px_rgba(139,92,246,0.65)]',
                'transition-transform duration-300 group-hover:scale-105',
              )}
            >
              <PlayIcon className="ml-0.5 size-6 text-white" />
            </div>
          </div>
        )}

        <span className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/55 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {video.duration}
        </span>

        {video.provider && (
          <span className="absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/45 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-200 backdrop-blur-md">
            {video.provider}
          </span>
        )}
      </button>

      <div className="space-y-3.5 p-4 sm:p-4">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white">
            {video.title}
          </h3>
          <Badge variant={statusBadgeVariant(video.status)} className="shrink-0 capitalize">
            {video.status}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-zinc-500">
          <div>
            <dt className="text-zinc-600">Erstellt</dt>
            <dd className="font-medium text-zinc-400">{formatVideoDate(video.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">Credits</dt>
            <dd className="font-medium text-violet-300/90">{video.creditsUsed}</dd>
          </div>
          {video.niche ? (
            <div className="col-span-2">
              <dt className="text-zinc-600">Nische</dt>
              <dd className="truncate font-medium text-zinc-400">{video.niche}</dd>
            </div>
          ) : null}
          {video.platform ? (
            <div className="col-span-2">
              <dt className="text-zinc-600">Plattform</dt>
              <dd className="font-medium text-zinc-400">{video.platform}</dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-wrap gap-2 pt-0.5">
          <Button
            size="sm"
            variant="primary"
            disabled={!canPlay}
            onClick={() => onPlay(video)}
            className="btn-press min-w-0 flex-1"
          >
            <PlayIcon className="size-3.5" />
            Abspielen
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!canDownload}
            onClick={() => downloadVideoMp4(video)}
            className="btn-press"
            title="MP4 herunterladen"
          >
            <DownloadIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!canRegenerate || isRegenerating}
            loading={isRegenerating}
            onClick={() => onRegenerate(video)}
            className="btn-press"
            title="Erneut generieren"
          >
            {!isRegenerating && <ArrowPathIcon className="size-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isDeleting}
            loading={isDeleting}
            onClick={() => onDelete(video)}
            className="btn-press text-red-400/90 hover:bg-red-500/10 hover:text-red-300"
            title="Löschen"
          >
            {!isDeleting && <TrashIcon className="size-4" />}
          </Button>
        </div>

        {video.errorMessage && video.status === 'failed' && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[11px] leading-relaxed text-amber-200/80">
            {video.errorMessage}
          </p>
        )}

        {(isDeleting || isRegenerating) && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <SpinnerInline size="sm" />
            {isDeleting ? 'Wird gelöscht …' : 'Regenerierung …'}
          </div>
        )}
      </div>
    </article>
  )
}
