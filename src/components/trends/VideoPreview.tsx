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

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  )
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
  const touchRef = useRef(isTouchDevice())
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [showControls, setShowControls] = useState(false)

  const canPlay = Boolean(videoUrl)
  const showThumbnail = !isPlaying || autoplayBlocked || !videoReady

  const playVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || !canPlay) return

    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', 'true')

    try {
      await video.play()
      setIsPlaying(true)
      setAutoplayBlocked(false)
    } catch {
      setIsPlaying(false)
      setAutoplayBlocked(true)
    }
  }, [canPlay])

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    setIsPlaying(false)
    setShowControls(false)
  }, [])

  useEffect(() => {
    if (touchRef.current) return
    if (isHovered && canPlay && !autoplayBlocked) {
      void playVideo()
    } else if (!isHovered) {
      pauseVideo()
      const video = videoRef.current
      if (video) video.currentTime = 0
    }
  }, [isHovered, canPlay, autoplayBlocked, playVideo, pauseVideo])

  function handleTap(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    if (!canPlay) return

    if (isPlaying) {
      pauseVideo()
      return
    }

    setShowControls(touchRef.current)
    void playVideo()
  }

  return (
    <div
      className={cn(
        'video-preview relative overflow-hidden bg-zinc-950',
        aspectClass,
        className,
      )}
      onMouseEnter={() => !touchRef.current && setIsHovered(true)}
      onMouseLeave={() => !touchRef.current && setIsHovered(false)}
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
      aria-label={
        canPlay
          ? isPlaying
            ? `${alt} — Video pausieren`
            : `${alt} — Video abspielen`
          : alt
      }
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
          'absolute inset-0 size-full object-cover transition-opacity duration-300',
          showThumbnail ? 'opacity-100' : 'opacity-0',
        )}
      />

      {canPlay && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload={priority ? 'metadata' : 'none'}
          controls={showControls && touchRef.current}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-300',
            showThumbnail ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/25"
        aria-hidden
      />

      {canPlay && showThumbnail && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-200 sm:size-12',
              isHovered && !touchRef.current && 'scale-105',
            )}
          >
            <PlayIcon className="ml-0.5 size-6 text-white sm:size-5" aria-hidden />
          </div>
          {touchRef.current && (
            <span className="absolute bottom-14 text-[10px] font-medium text-white/70">
              Tippen zum Abspielen
            </span>
          )}
        </div>
      )}

      {duration && (
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
          {duration}
        </span>
      )}
    </div>
  )
}
