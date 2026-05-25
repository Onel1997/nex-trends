import { memo, useCallback, useState } from 'react'
import { cn } from '@/lib'
import { useVideoCardPlayback } from '@/hooks/useVideoCardPlayback'
import type { VideoPreloadTier } from '@/lib/video-feed-preload'
import { VolumeOffIcon, VolumeOnIcon } from '@/components/ui/icons'

export type VideoCardProps = {
  playbackId: string
  videoUrl?: string
  posterUrl?: string
  alt: string
  duration?: string
  priority?: boolean
  feedIndex?: number
  preloadTier?: VideoPreloadTier
  aspectClass?: string
  className?: string
  onVideoUnavailable?: () => void
}

function VolumePulseIcon({ active }: { active: boolean }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      {active && (
        <span
          className="absolute inset-0 animate-volume-pulse rounded-full bg-violet-400/30"
          aria-hidden
        />
      )}
      <VolumeOnIcon
        className={cn('relative size-5', active && 'animate-volume-icon')}
        aria-hidden
      />
    </span>
  )
}

function AnimatedPreviewFallback() {
  return (
    <div className="video-card__animated-preview absolute inset-0 overflow-hidden" aria-hidden>
      <div className="video-card__ken-burns absolute inset-[-8%] bg-gradient-to-br from-violet-900/50 via-zinc-900 to-fuchsia-900/40" />
      <div className="absolute inset-0 animate-shimmer bg-zinc-900/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.25),transparent_55%)]" />
    </div>
  )
}

function VideoCardComponent({
  playbackId,
  videoUrl,
  posterUrl,
  alt,
  duration,
  priority = false,
  feedIndex = -1,
  preloadTier = 'none',
  aspectClass = 'aspect-[9/16] w-full',
  className,
  onVideoUnavailable,
}: VideoCardProps) {
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [posterError, setPosterError] = useState(false)
  const [soundToast, setSoundToast] = useState(false)

  const showSoundToast = useCallback(() => {
    setSoundToast(true)
    window.setTimeout(() => setSoundToast(false), 1000)
  }, [])

  const {
    containerRef,
    videoRef,
    playbackUrl,
    formatValid,
    showVideoElement,
    resolvedPoster,
    preload,
    videoVisible,
    isPlaying,
    isMuted,
    hasSound,
    videoReady,
    showStallHint,
    showTapForSound,
    playbackDebug,
    toggleMute,
    handleCardTap,
    handleVideoReady,
    handleCanPlay,
    handleLoadedMetadata,
    handleVideoError,
    handlePlay,
    handlePause,
  } = useVideoCardPlayback({
    playbackId,
    videoUrl,
    posterUrl,
    priority,
    feedIndex,
    preloadTier,
    onVideoUnavailable,
    onSoundOn: showSoundToast,
  })

  const showPoster = resolvedPoster && !posterError
  const showAnimatedFallback = !showPoster || (!videoVisible && !posterLoaded)

  return (
    <div
      ref={containerRef}
      className={cn(
        'video-card relative isolate overflow-hidden bg-zinc-950',
        aspectClass,
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerUp={handleCardTap}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-zinc-950 to-fuchsia-950/70"
        aria-hidden
      />

      {showAnimatedFallback && <AnimatedPreviewFallback />}

      {showPoster ? (
        <img
          src={resolvedPoster}
          alt={alt}
          loading={priority || preloadTier === 'hot' ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onLoad={() => {
            setPosterLoaded(true)
            setPosterError(false)
          }}
          onError={() => {
            setPosterError(true)
            setPosterLoaded(false)
          }}
          className={cn(
            'video-card__poster absolute inset-0 size-full object-cover',
            videoVisible ? 'opacity-0' : 'opacity-100',
          )}
        />
      ) : null}

      {showVideoElement && playbackUrl ? (
        <video
          key={`${playbackId}-${playbackUrl}`}
          ref={videoRef}
          src={playbackUrl}
          poster={resolvedPoster || undefined}
          loop
          muted={isMuted}
          playsInline
          preload={preload}
          disablePictureInPicture
          controls={false}
          controlsList="nodownload noplaybackrate"
          onLoadedData={handleVideoReady}
          onCanPlay={handleCanPlay}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleVideoError}
          className={cn(
            'video-card__video absolute inset-0 z-[1] size-full object-cover',
            videoVisible && 'video-card__video--visible',
          )}
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"
        aria-hidden
      />

      {isPlaying && videoReady && (
        <span className="video-card__live pointer-events-none absolute left-2.5 top-2.5 z-[25] flex items-center gap-1 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg">
          <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
          Live
        </span>
      )}

      {showTapForSound && (
        <button
          type="button"
          onPointerUp={handleCardTap}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className={cn(
            'video-card__tap-sound absolute inset-0 z-[50] flex items-center justify-center',
            'bg-black/25 backdrop-blur-[2px]',
          )}
          aria-label="Tippen für Ton"
        >
          <span className="animate-fade-in flex items-center gap-2 rounded-full bg-black/65 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/20">
            <VolumeOffIcon className="size-4 opacity-80" aria-hidden />
            Tap for sound
          </span>
        </button>
      )}

      {formatValid && (
        <button
          type="button"
          onPointerUp={(e) => {
            e.stopPropagation()
            toggleMute(e)
          }}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className={cn(
            'video-card__mute absolute top-2.5 right-2.5 z-[60]',
            'flex size-11 items-center justify-center rounded-full',
            'bg-black/65 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md',
            'transition-transform duration-200 ease-out touch-manipulation',
            'active:scale-90',
            hasSound && 'video-card__mute--active ring-violet-400/60',
            !videoReady && 'opacity-90',
          )}
          aria-label={isMuted ? 'Ton einschalten' : 'Ton stummschalten'}
          aria-pressed={!isMuted}
        >
          {hasSound && !isMuted ? (
            <VolumePulseIcon active />
          ) : (
            <VolumeOffIcon className="size-5" aria-hidden />
          )}
        </button>
      )}

      {soundToast && (
        <span
          className="video-card__sound-toast pointer-events-none absolute top-14 right-2.5 z-[55] animate-fade-in rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg"
          role="status"
        >
          Sound On
        </span>
      )}

      {showStallHint && !videoReady && (
        <span className="pointer-events-none absolute bottom-12 left-2 right-2 z-[15] rounded-lg bg-black/60 px-2 py-1 text-center text-[10px] text-zinc-300">
          Wechsle Clip …
        </span>
      )}

      {duration && (
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-[15] rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
          {duration}
        </span>
      )}

      {formatValid && playbackUrl && (
        <span
          className={cn(
            'pointer-events-none absolute bottom-10 left-2 z-[70] rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide',
            playbackDebug === 'PLAYING' && 'bg-emerald-600/90 text-white',
            playbackDebug === 'PAUSED' && 'bg-amber-600/90 text-white',
            playbackDebug === 'LOADING' && 'bg-zinc-700/90 text-zinc-200',
            playbackDebug === 'ERROR' && 'bg-red-600/90 text-white',
          )}
          aria-hidden
        >
          {playbackDebug}
        </span>
      )}
    </div>
  )
}

export const VideoCard = memo(VideoCardComponent, (prev, next) => {
  return (
    prev.playbackId === next.playbackId &&
    prev.videoUrl === next.videoUrl &&
    prev.posterUrl === next.posterUrl &&
    prev.priority === next.priority &&
    prev.feedIndex === next.feedIndex &&
    prev.preloadTier === next.preloadTier
  )
})
