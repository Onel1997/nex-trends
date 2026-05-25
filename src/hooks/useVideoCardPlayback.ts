import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInViewport } from '@/hooks/useInViewport'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { videoFeedCoordinator } from '@/lib/video-feed-coordinator'
import {
  isVideoUrlWarmed,
  preloadPosterUrl,
  warmVideoUrl,
  type VideoPreloadTier,
} from '@/lib/video-feed-preload'
import { videoPlaybackManager } from '@/lib/video-playback-manager'
import { resolveAdaptiveVideoUrl } from '@/lib/video-url-adaptive'
import {
  initVideoUserGestureListeners,
  isVideoAudioUnlocked,
  playVideoMutedFast,
  playVideoWithSound,
  subscribeVideoAudioUnlock,
  unlockVideoAudioOnCard,
} from '@/lib/video-user-gesture'
import {
  isPlayableDemoVideoUrl,
  posterForVideoUrl,
} from '@/lib/demo-media'
import { logVideoPlayback } from '@/lib/video-playback-log'
import { isValidVideoUrl } from '@/lib/video-url'

const ACTIVE_RATIO = 0.32
const LOAD_STALL_MS = 3_200
const TAP_DEBOUNCE_MS = 400
const DETACH_NEAR_MS = 8_000
const DETACH_FAR_MS = 2_500

export type UseVideoCardPlaybackOptions = {
  playbackId: string
  videoUrl?: string
  posterUrl?: string
  priority?: boolean
  feedIndex?: number
  preloadTier?: VideoPreloadTier
  onVideoUnavailable?: () => void
  onSoundOn?: () => void
}

function applySafariVideoAttrs(video: HTMLVideoElement): void {
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', 'true')
  video.muted = true
  video.setAttribute('muted', '')
  video.volume = 0
  video.defaultMuted = true
}

function rootMarginForTier(tier: VideoPreloadTier, priority: boolean): string {
  if (priority || tier === 'hot') return '40% 0px 55% 0px'
  if (tier === 'warm') return '30% 0px 45% 0px'
  if (tier === 'metadata') return '18% 0px 28% 0px'
  return '12% 0px 20% 0px'
}

export function useVideoCardPlayback({
  playbackId,
  videoUrl,
  posterUrl,
  priority = false,
  feedIndex = -1,
  preloadTier = 'none',
  onVideoUnavailable,
  onSoundOn,
}: UseVideoCardPlaybackOptions) {
  const playbackUrl = resolveAdaptiveVideoUrl(videoUrl) ?? videoUrl
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isTouch = useIsTouchDevice()
  const canPlayRef = useRef(false)
  const isActiveRef = useRef(false)
  const viewportRatioRef = useRef(0)
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const detachTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const wantsSoundRef = useRef(false)
  const needsGestureRetryRef = useRef(false)
  const playVideoRef = useRef<() => Promise<void>>(async () => {})
  const lastTapRef = useRef(0)
  const logTag = playbackId.length > 12 ? playbackId.slice(-10) : playbackId

  const [audioUnlocked, setAudioUnlocked] = useState(() => isVideoAudioUnlocked())
  const [isNearViewport, setIsNearViewport] = useState(
    priority || preloadTier === 'hot' || preloadTier === 'warm',
  )
  const [isActiveViewport, setIsActiveViewport] = useState(false)
  const [videoElementMounted, setVideoElementMounted] = useState(
    priority || preloadTier === 'hot',
  )
  const [posterReady, setPosterReady] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [hasSound, setHasSound] = useState(false)
  const [showStallHint, setShowStallHint] = useState(false)
  const [showTapForSound, setShowTapForSound] = useState(false)

  const resolvedPoster =
    posterUrl?.trim() ||
    (playbackUrl ? posterForVideoUrl(playbackUrl) ?? '' : '')

  const formatValid =
    isValidVideoUrl(playbackUrl) && isPlayableDemoVideoUrl(playbackUrl)

  const prefetchZone =
    priority || preloadTier === 'hot' || preloadTier === 'warm'
  const shouldAttachVideo =
    formatValid && posterReady && (isNearViewport || prefetchZone)

  const htmlPreload =
    preloadTier === 'hot' || isActiveViewport
      ? 'auto'
      : preloadTier === 'warm' || isNearViewport
        ? 'auto'
        : preloadTier === 'metadata'
          ? 'metadata'
          : 'none'

  useEffect(() => {
    if (!resolvedPoster) return
    preloadPosterUrl(resolvedPoster)
  }, [resolvedPoster])

  useEffect(() => {
    if (!formatValid || !playbackUrl) return
    if (preloadTier === 'hot' || preloadTier === 'warm' || priority) {
      warmVideoUrl(playbackUrl, preloadTier === 'none' ? 'metadata' : preloadTier)
    }
  }, [playbackUrl, formatValid, preloadTier, priority])

  useEffect(() => initVideoUserGestureListeners(), [])

  useEffect(() => {
    return subscribeVideoAudioUnlock(() => {
      setAudioUnlocked(isVideoAudioUnlocked())
      if (needsGestureRetryRef.current && isActiveRef.current) {
        logVideoPlayback('retry play after gesture', { tag: logTag })
        needsGestureRetryRef.current = false
        void playVideoRef.current()
      }
    })
  }, [logTag])

  useEffect(() => {
    setShowTapForSound(
      Boolean(videoReady && isPlaying && !audioUnlocked && !hasSound),
    )
  }, [videoReady, isPlaying, audioUnlocked, hasSound])

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      window.clearTimeout(stallTimerRef.current)
      stallTimerRef.current = null
    }
  }, [])

  const clearDetachTimer = useCallback(() => {
    if (detachTimerRef.current) {
      window.clearTimeout(detachTimerRef.current)
      detachTimerRef.current = null
    }
  }, [])

  const syncMutedState = useCallback(
    (muted: boolean) => {
      const video = videoRef.current
      if (video) {
        video.muted = muted
        if (muted) {
          video.setAttribute('muted', '')
          video.volume = 0
        } else {
          video.removeAttribute('muted')
          video.volume = 1
        }
      }
      setIsMuted(muted)
      setHasSound(
        !muted &&
          wantsSoundRef.current &&
          videoPlaybackManager.hasAudio(playbackId),
      )
    },
    [playbackId],
  )

  const enableSound = useCallback(async (): Promise<boolean> => {
    const video = videoRef.current
    if (!video || !formatValid) return false

    wantsSoundRef.current = true
    videoPlaybackManager.requestAudio(playbackId)

    const ok = await playVideoWithSound(video)
    if (ok) {
      syncMutedState(false)
      setIsPlaying(true)
      setAudioUnlocked(true)
      setShowTapForSound(false)
      onSoundOn?.()
      return true
    }

    wantsSoundRef.current = false
    videoPlaybackManager.releaseAudio(playbackId)
    syncMutedState(true)
    return false
  }, [formatValid, onSoundOn, playbackId, syncMutedState])

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (video) video.pause()
    setIsPlaying(false)
    syncMutedState(true)
    videoPlaybackManager.release(playbackId)
  }, [playbackId, syncMutedState])

  const playVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video) {
      logVideoPlayback('play skipped (no ref)', { tag: logTag })
      return
    }
    if (!isActiveRef.current) {
      logVideoPlayback('play skipped (not active)', { tag: logTag })
      return
    }
    if (!canPlayRef.current) {
      logVideoPlayback('play skipped (not mounted)', { tag: logTag })
      return
    }

    applySafariVideoAttrs(video)

    const playPriority = Math.max(viewportRatioRef.current, ACTIVE_RATIO)
    videoPlaybackManager.requestPlay(playbackId, playPriority, isTouch)

    if (!videoPlaybackManager.isAllowed(playbackId, isTouch)) {
      logVideoPlayback('play blocked (slot busy)', { tag: logTag, playPriority })
      window.requestAnimationFrame(() => {
        if (isActiveRef.current && canPlayRef.current) {
          void playVideoRef.current()
        }
      })
      return
    }

    const staggerMs = videoPlaybackManager.getStaggerDelay(playbackId, isTouch)
    if (staggerMs > 0) {
      await new Promise<void>((r) => window.setTimeout(r, staggerMs))
    }

    if (!canPlayRef.current || !isActiveRef.current) return
    if (!videoPlaybackManager.isAllowed(playbackId, isTouch)) return

    if (wantsSoundRef.current && isVideoAudioUnlocked()) {
      const ok = await enableSound()
      if (ok) {
        needsGestureRetryRef.current = false
        clearStallTimer()
        return
      }
    }

    syncMutedState(true)
    const ok = await playVideoMutedFast(video, logTag)
    if (ok) {
      needsGestureRetryRef.current = false
      setIsPlaying(true)
      setShowStallHint(false)
      clearStallTimer()
    } else {
      setIsPlaying(false)
      if (isActiveRef.current && videoPlaybackManager.isAllowed(playbackId, isTouch)) {
        needsGestureRetryRef.current = true
        logVideoPlayback('play failed (retry on gesture)', { tag: logTag })
      } else {
        videoPlaybackManager.release(playbackId)
      }
    }
  }, [
    clearStallTimer,
    enableSound,
    isTouch,
    logTag,
    playbackId,
    syncMutedState,
  ])

  playVideoRef.current = playVideo

  const scheduleStallWatch = useCallback(() => {
    clearStallTimer()
    stallTimerRef.current = window.setTimeout(() => {
      if (videoReady) return

      if (retryCountRef.current < 1) {
        retryCountRef.current += 1
        const video = videoRef.current
        if (video) {
          video.load()
          void playVideo()
          scheduleStallWatch()
        }
        return
      }

      setShowStallHint(true)
      if (onVideoUnavailable) {
        retryCountRef.current = 0
        onVideoUnavailable()
      }
    }, LOAD_STALL_MS)
  }, [clearStallTimer, onVideoUnavailable, playVideo, videoReady])

  const setVideoElementRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node
      if (!node) {
        canPlayRef.current = false
        setVideoElementMounted(false)
        return
      }
      setVideoElementMounted(true)
      canPlayRef.current = shouldAttachVideo
      applySafariVideoAttrs(node)
      if (isVideoUrlWarmed(playbackUrl) && node.readyState >= 2) {
        setVideoReady(true)
      }
      logVideoPlayback('video ref attached', {
        tag: logTag,
        readyState: node.readyState,
        active: isActiveRef.current,
      })
      if (isActiveRef.current) {
        queueMicrotask(() => void playVideoRef.current())
      }
    },
    [logTag, playbackUrl, shouldAttachVideo],
  )

  const handleCardTap = useCallback(
    (e: React.PointerEvent | React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      const now = Date.now()
      if (now - lastTapRef.current < TAP_DEBOUNCE_MS) return
      lastTapRef.current = now

      const video = videoRef.current
      if (!video || !formatValid || !videoReady) return

      if (!isVideoAudioUnlocked()) {
        void unlockVideoAudioOnCard(video, true).then((ok) => {
          if (ok) {
            wantsSoundRef.current = true
            videoPlaybackManager.requestAudio(playbackId)
            syncMutedState(false)
            setIsPlaying(true)
            setAudioUnlocked(true)
            setShowTapForSound(false)
            onSoundOn?.()
          } else {
            void playVideoMutedFast(video).then((mutedOk) => {
              if (mutedOk) setIsPlaying(true)
              setAudioUnlocked(isVideoAudioUnlocked())
            })
          }
        })
      }
    },
    [formatValid, onSoundOn, playbackId, syncMutedState, videoReady],
  )

  const toggleMute = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      e?.preventDefault()

      const now = Date.now()
      if (now - lastTapRef.current < TAP_DEBOUNCE_MS) return
      lastTapRef.current = now

      const video = videoRef.current
      if (!video || !formatValid || !videoReady) return

      if (hasSound && !isMuted) {
        wantsSoundRef.current = false
        videoPlaybackManager.releaseAudio(playbackId)
        syncMutedState(true)
        void playVideoMutedFast(video).then((ok) => {
          if (ok) setIsPlaying(true)
        })
        return
      }

      void enableSound()
    },
    [enableSound, formatValid, hasSound, isMuted, playbackId, syncMutedState, videoReady],
  )

  useEffect(() => {
    canPlayRef.current = shouldAttachVideo && videoElementMounted
    if (canPlayRef.current && isActiveRef.current) {
      void playVideoRef.current()
    }
  }, [shouldAttachVideo, videoElementMounted])

  useEffect(() => {
    isActiveRef.current = isActiveViewport
    if (isActiveViewport && canPlayRef.current) {
      void playVideoRef.current()
    } else if (!isActiveViewport) {
      pauseVideo()
      const video = videoRef.current
      if (video) video.currentTime = 0
    }
  }, [isActiveViewport, pauseVideo])

  useLayoutEffect(() => {
    return videoPlaybackManager.register(
      playbackId,
      () => pauseVideo(),
      () => syncMutedState(true),
    )
  }, [pauseVideo, playbackId, syncMutedState])

  useEffect(() => {
    retryCountRef.current = 0
    setVideoReady(false)
    setIsPlaying(false)
    setShowStallHint(false)
    setPosterReady(true)
    wantsSoundRef.current = false
    syncMutedState(true)
    videoPlaybackManager.releaseAudio(playbackId)
    videoPlaybackManager.release(playbackId)

    if (preloadTier === 'hot' || priority) {
      setVideoElementMounted(true)
      setIsNearViewport(true)
    }
  }, [playbackUrl, syncMutedState, playbackId, preloadTier, priority])

  useEffect(() => {
    if (shouldAttachVideo) {
      clearDetachTimer()
      return undefined
    }
    clearDetachTimer()
    const delay =
      preloadTier === 'hot' || preloadTier === 'warm' ? DETACH_NEAR_MS : DETACH_FAR_MS
    detachTimerRef.current = window.setTimeout(() => {
      setVideoElementMounted(false)
    }, delay)
    return () => clearDetachTimer()
  }, [shouldAttachVideo, preloadTier, clearDetachTimer])

  useEffect(() => {
    if (!shouldAttachVideo || videoReady) {
      clearStallTimer()
      return
    }
    scheduleStallWatch()
    return clearStallTimer
  }, [shouldAttachVideo, videoReady, scheduleStallWatch, clearStallTimer])

  const { ref: containerRef } = useInViewport({
    observe: true,
    rootMargin: rootMarginForTier(preloadTier, priority),
    threshold: [0, 0.06, ACTIVE_RATIO, 0.5, 0.82],
    onIntersecting: (visible, ratio) => {
      const near = visible && ratio > 0.04
      const active = visible && ratio >= ACTIVE_RATIO
      viewportRatioRef.current = visible ? ratio : 0
      setIsNearViewport(near || prefetchZone)
      setIsActiveViewport(active)
      isActiveRef.current = active

      if (feedIndex >= 0) {
        videoFeedCoordinator.reportVisibility(
          feedIndex,
          visible ? ratio : 0,
          videoUrl,
          resolvedPoster,
        )
      }

      if (active) {
        logVideoPlayback('observer enter', {
          tag: logTag,
          ratio,
          feedIndex,
        })
        videoPlaybackManager.requestPlay(
          playbackId,
          Math.max(ratio, ACTIVE_RATIO),
          isTouch,
        )
        queueMicrotask(() => void playVideoRef.current())
      } else {
        logVideoPlayback('observer leave', { tag: logTag, ratio, visible })
        videoPlaybackManager.release(playbackId)
      }
    },
  })

  useLayoutEffect(() => {
    if (videoElementMounted && isActiveRef.current && canPlayRef.current) {
      void playVideoRef.current()
    }
  }, [videoElementMounted])

  const handleVideoReady = useCallback(() => {
    setVideoReady(true)
    setShowStallHint(false)
    clearStallTimer()
    logVideoPlayback('video ready (loadeddata)', { tag: logTag })
    if (isActiveRef.current) void playVideoRef.current()
  }, [clearStallTimer, logTag])

  const handleCanPlay = useCallback(() => {
    if (!videoReady) {
      setVideoReady(true)
      logVideoPlayback('video ready (canplay)', { tag: logTag })
    }
    if (isActiveRef.current) void playVideoRef.current()
  }, [logTag, videoReady])

  const handleVideoError = useCallback(() => {
    setVideoReady(false)
    setIsPlaying(false)
    if (onVideoUnavailable) onVideoUnavailable()
  }, [onVideoUnavailable])

  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => setIsPlaying(false), [])

  const showVideoElement = shouldAttachVideo || videoElementMounted
  const videoVisible =
    showVideoElement &&
    videoReady &&
    (isPlaying || (isActiveViewport && videoElementMounted))

  return {
    containerRef,
    videoRef: setVideoElementRef,
    playbackUrl,
    formatValid,
    showVideoElement: formatValid && showVideoElement,
    resolvedPoster,
    preload: htmlPreload,
    videoVisible,
    isPlaying,
    isMuted,
    hasSound,
    videoReady,
    showStallHint,
    showTapForSound,
    isActiveViewport,
    audioUnlocked,
    toggleMute,
    handleCardTap,
    handleVideoReady,
    handleCanPlay,
    handleVideoError,
    handlePlay,
    handlePause,
  }
}
