import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib'
import { PlayIcon } from '@/components/ui/icons'

type VideoPreviewProps = {
  thumbnailUrl: string
  videoUrl?: string
  alt: string
  duration?: string
  className?: string
  aspectClass?: string
  priority?: boolean
}

export function VideoPreview({
  thumbnailUrl,
  videoUrl,
  alt,
  duration,
  className,
  aspectClass = 'aspect-[9/16]',
  priority = false,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  const canPlay = Boolean(videoUrl)

  const playVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || !canPlay) return
    try {
      video.currentTime = 0
      await video.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }, [canPlay])

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    if (isHovered && canPlay) {
      void playVideo()
    } else {
      pauseVideo()
    }
  }, [isHovered, canPlay, playVideo, pauseVideo])

  function handleTap(e: React.MouseEvent) {
    e.stopPropagation()
    if (!canPlay) return
    if (isPlaying) {
      pauseVideo()
    } else {
      void playVideo()
    }
  }

  return (
    <div
      className={cn(
        'video-preview relative overflow-hidden bg-zinc-950',
        aspectClass,
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTap}
      role={canPlay ? 'button' : undefined}
      tabIndex={canPlay ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          if (isPlaying) pauseVideo()
          else void playVideo()
        }
      }}
      aria-label={canPlay ? `${alt} — Video-Vorschau abspielen` : alt}
    >
      {!thumbLoaded && (
        <div className="absolute inset-0 animate-shimmer bg-zinc-900" aria-hidden />
      )}

      <img
        src={thumbnailUrl}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setThumbLoaded(true)}
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity duration-500',
          isPlaying && videoReady ? 'opacity-0' : 'opacity-100',
        )}
      />

      {canPlay && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setVideoReady(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-500',
            isPlaying && videoReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30"
        aria-hidden
      />

      {!isPlaying && canPlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/25 transition-all duration-300',
              isHovered && 'scale-110 bg-white/25',
            )}
          >
            <PlayIcon className="ml-0.5 size-5 text-white" aria-hidden />
          </div>
        </div>
      )}

      {duration && (
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {duration}
        </span>
      )}
    </div>
  )
}