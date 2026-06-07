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
/** First / priority card activates with minimal visible area */
const ACTIVE_RATIO_PRIORITY = 0.06
const FEED_IO_ROOT_MARGIN = '300px 0px 300px 0px'
const LOAD_STALL_MS = 3_200
const TAP_DEBOUNCE_MS = 400
const DETACH_NEAR_MS = 8_000
const DETACH_FAR_MS = 2_500

export type PlaybackDebugState = 'LOADING' | 'PLAYING' | 'PAUSED' | 'ERROR'

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

function applySafariVideoAttrs(video: HTMLVideoElement, muted = true): void {
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', 'true')
  video.autoplay = true
  video.setAttribute('autoplay', '')
  video.muted = muted
  if (muted) {
    video.setAttribute('muted', '')
    video.volume = 0
    video.defaultMuted = true
  } else {
    video.removeAttribute('muted')
    video.volume = 1
    video.defaultMuted = false
  }
}

function rootMarginForTier(tier: VideoPreloadTier, priority: boolean): string {
  if (priority || tier === 'hot') return FEED_IO_ROOT_MARGIN
  if (tier === 'warm') return '200px 0px 200px 0px'
  if (tier === 'metadata') return '120px 0px 120px 0px'
  return '80px 0px 80px 0px'
}

function activeRatioForCard(priority: boolean): number {
  return priority ? ACTIVE_RATIO_PRIORITY : ACTIVE_RATIO
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
  const isActiveRef = useRef(priority)
  const viewportRatioRef = useRef(0)
  const stallTimerRef = useRef<number | null>(null)
  const detachTimerRef = useRef<number | null>(null)
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
  const [isActiveViewport, setIsActiveViewport] = useState(priority)
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
  const [playbackDebug, setPlaybackDebug] = useState<PlaybackDebugState>('LOADING')
  const [hasPlaybackError, setHasPlaybackError] = useState(false)

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
    priority || preloadTier === 'hot' || isActiveViewport
      ? 'auto'
      : preloadTier === 'warm' || isNearViewport
        ? 'auto'
        : preloadTier === 'metadata'
          ? 'metadata'
          : 'none'

  const useFastStart = priority || preloadTier === 'hot'

  useEffect(() => {
    if (!resolvedPoster) return
    preloadPosterUrl(resolvedPoster)
  }, [resolvedPoster])

  useEffect(() => {
    if (!formatValid || !playbackUrl) return
    const tier =
      priority || preloadTier === 'hot'
        ? 'hot'
        : preloadTier === 'warm'
          ? 'warm'
          : preloadTier === 'none'
            ? 'metadata'
            : preloadTier
    warmVideoUrl(playbackUrl, tier)
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

  const kickoffVideoLoad = useCallback(() => {
    const video = videoRef.current
    if (!video || !formatValid) return
    video.preload = 'auto'
    applySafariVideoAttrs(video, video.muted)
    if (video.networkState === HTMLMediaElement.NETWORK_EMPTY || video.readyState < 1) {
      video.load()
      logVideoPlayback('kickoff load', {
        tag: logTag,
        src: video.currentSrc || video.src,
      })
    }
  }, [formatValid, logTag])

  const syncMutedStateFromVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const muted = video.muted
    setIsMuted(muted)
    setHasSound(!muted && !video.paused)
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
      setHasSound(Boolean(video && !muted && !video.paused))
    },
    [playbackId],
  )

  const updatePlaybackDebug = useCallback(() => {
    const video = videoRef.current
    if (hasPlaybackError) {
      setPlaybackDebug('ERROR')
      return
    }
    if (!video) {
      setPlaybackDebug('LOADING')
      return
    }
    if (!video.paused && !video.ended) {
      setPlaybackDebug('PLAYING')
      return
    }
    if (videoReady || video.readyState >= 2) {
      setPlaybackDebug('PAUSED')
      return
    }
    setPlaybackDebug('LOADING')
  }, [hasPlaybackError, videoReady])

  useEffect(() => {
    updatePlaybackDebug()
  }, [
    updatePlaybackDebug,
    isPlaying,
    videoReady,
    videoElementMounted,
    hasPlaybackError,
  ])

  const enableSound = useCallback(async (): Promise<boolean> => {
    const video = videoRef.current
    if (!video || !formatValid) return false

    wantsSoundRef.current = true
    videoPlaybackManager.requestAudio(playbackId)

    const ok = await playVideoWithSound(video)
    syncMutedStateFromVideo()
    updatePlaybackDebug()
    if (ok) {
      syncMutedState(false)
      setIsPlaying(!video.paused)
      setAudioUnlocked(true)
      setShowTapForSound(false)
      onSoundOn?.()
      return true
    }

    wantsSoundRef.current = false
    videoPlaybackManager.releaseAudio(playbackId)
    syncMutedState(true)
    return false
  }, [formatValid, onSoundOn, playbackId, syncMutedState, syncMutedStateFromVideo, updatePlaybackDebug])

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (video) video.pause()
    setIsPlaying(false)
    syncMutedState(true)
    videoPlaybackManager.release(playbackId)
    updatePlaybackDebug()
  }, [playbackId, syncMutedState, updatePlaybackDebug])

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
    applySafariVideoAttrs(video, !wantsSoundRef.current || !isVideoAudioUnlocked())

    const playPriority = Math.max(viewportRatioRef.current, activeRatioForCard(priority))
    videoPlaybackManager.requestPlay(playbackId, playPriority, isTouch)

    if (!videoPlaybackManager.isAllowed(playbackId, isTouch)) {
      logVideoPlayback('play blocked (slot busy)', { tag: logTag, playPriority })
      window.requestAnimationFrame(() => {
        if (isActiveRef.current) {
          void playVideoRef.current()
        }
      })
      return
    }

    const staggerMs = priority ? 0 : videoPlaybackManager.getStaggerDelay(playbackId, isTouch)
    if (staggerMs > 0) {
      await new Promise<void>((r) => window.setTimeout(r, staggerMs))
    }

    if (!isActiveRef.current) return
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
    const ok = await playVideoMutedFast(video, logTag, { fastStart: useFastStart })
    syncMutedStateFromVideo()
    updatePlaybackDebug()
    if (ok) {
      needsGestureRetryRef.current = false
      setIsPlaying(!video.paused)
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
    syncMutedStateFromVideo,
    updatePlaybackDebug,
    priority,
    useFastStart,
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
      canPlayRef.current = true
      applySafariVideoAttrs(node, isMuted)
      node.preload = 'auto'
      logVideoPlayback('video src', {
        tag: logTag,
        src: node.currentSrc || node.src,
      })
      kickoffVideoLoad()
      if (isVideoUrlWarmed(playbackUrl) && node.readyState >= 1) {
        setVideoReady(true)
      }
      logVideoPlayback('video ref attached', {
        tag: logTag,
        readyState: node.readyState,
        active: isActiveRef.current,
      })
      if (isActiveRef.current) {
        void playVideoRef.current()
      }
    },
    [isMuted, kickoffVideoLoad, logTag, playbackUrl],
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
    (e?: React.PointerEvent | React.MouseEvent) => {
      e?.stopPropagation()
      e?.preventDefault()

      const now = Date.now()
      if (now - lastTapRef.current < TAP_DEBOUNCE_MS) return
      lastTapRef.current = now

      const video = videoRef.current
      if (!video || !formatValid) return

      const nextMuted = !video.muted
      logVideoPlayback('toggle mute', {
        tag: logTag,
        nextMuted,
        src: video.currentSrc || video.src,
        paused: video.paused,
      })

      if (nextMuted) {
        wantsSoundRef.current = false
        videoPlaybackManager.releaseAudio(playbackId)
        video.muted = true
        video.setAttribute('muted', '')
        video.volume = 0
        syncMutedStateFromVideo()
        if (video.paused && isActiveRef.current) {
          void playVideoMutedFast(video, logTag, { fastStart: useFastStart }).then((ok) => {
            if (ok) setIsPlaying(true)
            syncMutedStateFromVideo()
            updatePlaybackDebug()
          })
        }
        return
      }

      wantsSoundRef.current = true
      videoPlaybackManager.requestAudio(playbackId)
      video.muted = false
      video.removeAttribute('muted')
      video.volume = 1
      applySafariVideoAttrs(video, false)

      if (video.paused) {
        if (video.readyState < 2) video.load()
        void video.play().then(() => {
          syncMutedStateFromVideo()
          setIsPlaying(!video.paused)
          setShowTapForSound(false)
          updatePlaybackDebug()
          if (!video.paused) onSoundOn?.()
        }).catch(() => {
          void enableSound()
        })
      } else {
        syncMutedStateFromVideo()
        setShowTapForSound(false)
        onSoundOn?.()
      }
    },
    [
      enableSound,
      formatValid,
      logTag,
      onSoundOn,
      playbackId,
      syncMutedStateFromVideo,
      updatePlaybackDebug,
      useFastStart,
    ],
  )

  useEffect(() => {
    canPlayRef.current = shouldAttachVideo && videoElementMounted
    if (shouldAttachVideo && videoElementMounted) {
      kickoffVideoLoad()
    }
    if (canPlayRef.current && isActiveRef.current) {
      void playVideoRef.current()
    }
  }, [shouldAttachVideo, videoElementMounted, kickoffVideoLoad])

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
      () => {
        const video = videoRef.current
        if (video) {
          video.muted = true
          video.setAttribute('muted', '')
          video.volume = 0
        }
        wantsSoundRef.current = false
        syncMutedStateFromVideo()
      },
    )
  }, [pauseVideo, playbackId, syncMutedStateFromVideo])

  useLayoutEffect(() => {
    if (!priority || !formatValid || !playbackUrl) return
    isActiveRef.current = true
    setIsActiveViewport(true)
    setIsNearViewport(true)
    videoPlaybackManager.requestPlay(playbackId, 1, isTouch)
    warmVideoUrl(playbackUrl, 'hot')
    kickoffVideoLoad()
    void playVideoRef.current()
  }, [priority, formatValid, playbackUrl, playbackId, isTouch, kickoffVideoLoad])

  useEffect(() => {
    retryCountRef.current = 0
    setVideoReady(false)
    setIsPlaying(false)
    setShowStallHint(false)
    setPosterReady(true)
    setHasPlaybackError(false)
    setPlaybackDebug('LOADING')
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

  const activeRatio = activeRatioForCard(priority)

  const { ref: containerRef } = useInViewport({
    observe: true,
    rootMargin: rootMarginForTier(preloadTier, priority),
    threshold: [0, 0.04, activeRatio, ACTIVE_RATIO, 0.5, 0.82],
    onIntersecting: (visible, ratio) => {
      const near = visible && ratio > 0.02
      const active = visible && ratio >= activeRatio
      viewportRatioRef.current = visible ? ratio : 0
      setIsNearViewport(near || prefetchZone)
      setIsActiveViewport(active)
      isActiveRef.current = active

      if (near || active) {
        kickoffVideoLoad()
      }

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
          activeRatio,
        })
        videoPlaybackManager.requestPlay(
          playbackId,
          Math.max(ratio, activeRatio),
          isTouch,
        )
        void playVideoRef.current()
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
    const video = videoRef.current
    setVideoReady(true)
    setShowStallHint(false)
    clearStallTimer()
    logVideoPlayback('loadeddata', {
      tag: logTag,
      src: video?.currentSrc || video?.src,
      readyState: video?.readyState,
    })
    updatePlaybackDebug()
    if (isActiveRef.current) void playVideoRef.current()
  }, [clearStallTimer, logTag, updatePlaybackDebug])

  const handleCanPlay = useCallback(() => {
    const video = videoRef.current
    setVideoReady(true)
    setShowStallHint(false)
    clearStallTimer()
    logVideoPlayback('canplay', {
      tag: logTag,
      src: video?.currentSrc || video?.src,
      readyState: video?.readyState,
    })
    updatePlaybackDebug()
    if (isActiveRef.current) void playVideoRef.current()
  }, [clearStallTimer, logTag, updatePlaybackDebug])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    logVideoPlayback('loadedmetadata', {
      tag: logTag,
      src: video?.currentSrc || video?.src,
      readyState: video?.readyState,
    })
    updatePlaybackDebug()
  }, [logTag, updatePlaybackDebug])

  const handleVideoError = useCallback(() => {
    const video = videoRef.current
    setVideoReady(false)
    setIsPlaying(false)
    setHasPlaybackError(true)
    setPlaybackDebug('ERROR')
    logVideoPlayback('video error', {
      tag: logTag,
      src: video?.currentSrc || video?.src,
      error: video?.error?.code,
    })
    if (onVideoUnavailable) onVideoUnavailable()
  }, [logTag, onVideoUnavailable])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    syncMutedStateFromVideo()
    updatePlaybackDebug()
  }, [syncMutedStateFromVideo, updatePlaybackDebug])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    updatePlaybackDebug()
  }, [updatePlaybackDebug])

  const showVideoElement = shouldAttachVideo || videoElementMounted
  const videoVisible =
    showVideoElement && (isPlaying || (videoReady && isActiveViewport))

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
    handleLoadedMetadata,
    handleVideoError,
    handlePlay,
    handlePause,
    playbackDebug,
  }
}
