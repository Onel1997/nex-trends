import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib'
import { PlayIcon } from '@/components/ui/icons'
import { useInViewport } from '@/hooks/useInViewport'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { videoPlaybackManager } from '@/lib/video-playback-manager'
import { isLocalDemoVideo, isValidVideoUrl, probeVideoUrl } from '@/lib/video-url'

type VideoPreviewProps = {
  thumbnailUrl: string
  videoUrl?: string
  alt: string
  duration?: string
  className?: string
  aspectClass?: string
  priority?: boolean
  /** Stable id for playback slots (e.g. trend.id) */
  playbackId?: string
  /** card: taps pass through to TrendCard; detail: in-place playback */
  variant?: 'card' | 'detail'
}

const GRADIENT_PLACEHOLDER =
  'bg-gradient-to-br from-violet-950/90 via-zinc-900 to-fuchsia-950/80'

/** Ratio at which autoplay is allowed (masonry-friendly) */
const ACTIVE_RATIO = 0.08

export function VideoPreview({
  thumbnailUrl,
  videoUrl,
  alt,
  duration,
  className,
  aspectClass = 'aspect-[9/16]',
  priority = false,
  playbackId: playbackIdProp,
  variant = 'detail',
}: VideoPreviewProps) {
  const isCard = variant === 'card'
  const reactId = useId()
  const playbackId = playbackIdProp ?? reactId
  const videoRef = useRef<HTMLVideoElement>(null)
  const isTouch = useIsTouchDevice()
  const canPlayRef = useRef(false)
  const isActiveRef = useRef(priority)
  const playVideoRef = useRef<() => Promise<void>>(async () => {})
  const pauseVideoRef = useRef<() => void>(() => {})

  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const [thumbFailed, setThumbFailed] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [isNearViewport, setIsNearViewport] = useState(priority)
  const [isActiveViewport, setIsActiveViewport] = useState(priority)

  const formatValid = isValidVideoUrl(videoUrl)
  const shouldAttachVideo = formatValid && !videoFailed && (priority || isNearViewport)
  const canPlay = shouldAttachVideo
  const videoVisible = canPlay && isPlaying && videoReady && !videoFailed

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    setIsPlaying(false)
    videoPlaybackManager.release(playbackId)
  }, [playbackId])

  const playVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || !canPlayRef.current) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', 'true')

    videoPlaybackManager.requestPlay(playbackId)

    try {
      if (video.readyState < 2) {
        video.load()
      }
      await video.play()
      setIsPlaying(true)
      setAutoplayBlocked(false)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[VideoPreview] Playback blocked or failed:', videoUrl, err)
      }
      setIsPlaying(false)
      setAutoplayBlocked(true)
      videoPlaybackManager.release(playbackId)
    }
  }, [playbackId, videoUrl])

  const tryPlay = useCallback(() => {
    if (!canPlayRef.current || !isActiveRef.current) return
    void playVideoRef.current()
  }, [])

  useEffect(() => {
    playVideoRef.current = playVideo
    pauseVideoRef.current = pauseVideo
  }, [playVideo, pauseVideo])

  useEffect(() => {
    canPlayRef.current = canPlay
    if (canPlay && isActiveRef.current) {
      tryPlay()
    }
  }, [canPlay, tryPlay])

  useEffect(() => {
    isActiveRef.current = isActiveViewport
    if (isActiveViewport && canPlayRef.current) {
      tryPlay()
    } else if (!isActiveViewport) {
      pauseVideoRef.current()
      const video = videoRef.current
      if (video) video.currentTime = 0
    }
  }, [isActiveViewport, tryPlay])

  useEffect(() => {
    return videoPlaybackManager.register(playbackId, () => pauseVideoRef.current())
  }, [playbackId])

  useEffect(() => {
    setVideoFailed(false)
    setVideoReady(false)
    setIsPlaying(false)
    setAutoplayBlocked(false)
  }, [videoUrl])

  const { ref: containerRef } = useInViewport({
    observe: !priority,
    rootMargin: '240px 0px',
    threshold: [0, ACTIVE_RATIO, 0.35],
    onIntersecting: (visible, ratio) => {
      const near = visible && ratio > 0
      const active = visible && ratio >= ACTIVE_RATIO
      setIsNearViewport(priority || near)
      setIsActiveViewport(priority || active)
    },
  })

  useEffect(() => {
    if (!formatValid || !videoUrl || !shouldAttachVideo || isLocalDemoVideo(videoUrl)) {
      return
    }

    const controller = new AbortController()

    void probeVideoUrl(videoUrl, controller.signal).then((ok) => {
      if (controller.signal.aborted || ok) return
      if (import.meta.env.DEV) {
        console.warn('[VideoPreview] Metadata probe failed, relying on element load:', videoUrl)
      }
    })

    return () => controller.abort()
  }, [videoUrl, formatValid, shouldAttachVideo])

  const preloadMode = priority || isActiveViewport ? 'auto' : isNearViewport ? 'metadata' : 'none'
  const showThumbnail = !videoVisible || autoplayBlocked || videoFailed
  const showPlaceholder = (!thumbLoaded && !thumbFailed) || (videoFailed && !thumbLoaded)

  function handleMouseEnter() {
    if (isTouch) return
    setIsHovered(true)
    if (canPlayRef.current && isActiveRef.current && !autoplayBlocked) {
      void playVideoRef.current()
    }
  }

  function handleMouseLeave() {
    if (isTouch) return
    setIsHovered(false)
    if (!isCard) {
      pauseVideo()
      const video = videoRef.current
      if (video) video.currentTime = 0
    }
  }

  useEffect(() => {
    if (isTouch || !videoReady || isCard) return
    const video = videoRef.current
    if (!video || !canPlay) return
    if (!isHovered) {
      pauseVideoRef.current()
      const v = videoRef.current
      if (v) v.currentTime = 0
    }
  }, [isTouch, isHovered, videoReady, canPlay, isCard])

  function handleVideoError() {
    setVideoFailed(true)
    setVideoReady(false)
    setIsPlaying(false)
    pauseVideo()
  }

  function handleTap(e: React.MouseEvent) {
    if (isCard) return
    e.stopPropagation()
    if (!canPlay) return

    if (isPlaying) {
      pauseVideo()
      return
    }

    isActiveRef.current = true
    void playVideo()
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'video-preview relative overflow-hidden bg-zinc-950',
        aspectClass,
        className,
      )}
      onMouseEnter={!isTouch ? handleMouseEnter : undefined}
      onMouseLeave={!isTouch ? handleMouseLeave : undefined}
      onClick={!isCard ? handleTap : undefined}
      role={!isCard && canPlay ? 'button' : undefined}
      tabIndex={!isCard && canPlay ? 0 : undefined}
      onKeyDown={
        !isCard
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                if (isPlaying) pauseVideo()
                else void playVideo()
              }
            }
          : undefined
      }
      aria-hidden={isCard ? true : undefined}
      aria-label={
        isCard
          ? undefined
          : canPlay
            ? isPlaying
              ? `${alt} — Video pausieren`
              : `${alt} — Video abspielen`
            : alt
      }
    >
      <div className={cn('absolute inset-0', GRADIENT_PLACEHOLDER)} aria-hidden />

      {showPlaceholder && (
        <div className="absolute inset-0 animate-shimmer bg-zinc-900/60" aria-hidden />
      )}

      <img
        src={thumbnailUrl}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setThumbLoaded(true)}
        onError={() => {
          setThumbFailed(true)
          setThumbLoaded(false)
        }}
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out',
          showThumbnail || thumbFailed ? 'opacity-100' : 'opacity-0',
        )}
      />

      {thumbFailed && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-900/80"
          aria-hidden
        >
          <PlayIcon className="size-8 text-white/40" />
        </div>
      )}

      {shouldAttachVideo && (
        <video
          ref={(node) => {
            videoRef.current = node
            if (node) {
              node.muted = true
              node.defaultMuted = true
              node.setAttribute('playsinline', '')
              node.setAttribute('webkit-playsinline', 'true')
            }
          }}
          src={videoUrl}
          poster={thumbnailUrl}
          muted
          loop
          playsInline
          autoPlay={isActiveViewport && canPlay}
          preload={preloadMode}
          controls={false}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onLoadedData={() => {
            setVideoReady(true)
            tryPlay()
          }}
          onCanPlay={() => {
            setVideoReady(true)
            tryPlay()
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={handleVideoError}
          className={cn(
            'video-preview__video absolute inset-0 size-full object-cover',
            isCard && 'pointer-events-none',
            videoVisible ? 'video-preview__video--visible' : 'opacity-0',
          )}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/25"
        aria-hidden
      />

      {!isCard && canPlay && showThumbnail && !thumbFailed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-200 sm:size-12',
              isHovered && !isTouch && 'scale-105',
            )}
          >
            <PlayIcon className="ml-0.5 size-6 text-white sm:size-5" aria-hidden />
          </div>
          {isTouch && (
            <span className="absolute bottom-14 text-[10px] font-medium text-white/70">
              Tippen zum Abspielen
            </span>
          )}
        </div>
      )}

      {duration && (
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
          {duration}
        </span>
      )}
    </div>
  )
}
