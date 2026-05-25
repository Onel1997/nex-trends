import { useCallback, useEffect, useRef, useState } from 'react'
import { useInViewport } from '@/hooks/useInViewport'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { videoPlaybackManager } from '@/lib/video-playback-manager'
import {
  initVideoUserGestureListeners,
  isVideoAudioUnlocked,
  playVideoMuted,
  playVideoWithSound,
  subscribeVideoAudioUnlock,
  unlockVideoAudioOnCard,
} from '@/lib/video-user-gesture'
import {
  isPlayableDemoVideoUrl,
  posterForVideoUrl,
} from '@/lib/demo-media'
import { isValidVideoUrl } from '@/lib/video-url'

const ACTIVE_RATIO = 0.42
const LOAD_STALL_MS = 4_000
const POSTER_READY_MS = 350
const TAP_DEBOUNCE_MS = 450

export type UseVideoCardPlaybackOptions = {
  playbackId: string
  videoUrl?: string
  posterUrl?: string
  priority?: boolean
  onVideoUnavailable?: () => void
  onSoundOn?: () => void
}

export function useVideoCardPlayback({
  playbackId,
  videoUrl,
  posterUrl,
  priority = false,
  onVideoUnavailable,
  onSoundOn,
}: UseVideoCardPlaybackOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isTouch = useIsTouchDevice()
  const canPlayRef = useRef(false)
  const isActiveRef = useRef(priority)
  const viewportPriorityRef = useRef(priority ? 2 : 0)
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const wantsSoundRef = useRef(false)
  const lastTapRef = useRef(0)

  const [audioUnlocked, setAudioUnlocked] = useState(() => isVideoAudioUnlocked())
  const [isNearViewport, setIsNearViewport] = useState(priority)
  const [isActiveViewport, setIsActiveViewport] = useState(priority)
  const [posterReady, setPosterReady] = useState(!posterUrl && !videoUrl)
  const [videoReady, setVideoReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [hasSound, setHasSound] = useState(false)
  const [showStallHint, setShowStallHint] = useState(false)
  const [showTapForSound, setShowTapForSound] = useState(false)

  const resolvedPoster =
    posterUrl?.trim() ||
    (videoUrl ? posterForVideoUrl(videoUrl) ?? '' : '')

  const formatValid = isValidVideoUrl(videoUrl) && isPlayableDemoVideoUrl(videoUrl)
  const shouldAttachVideo =
    formatValid && posterReady && (priority || isNearViewport)

  useEffect(() => initVideoUserGestureListeners(), [])

  useEffect(() => {
    return subscribeVideoAudioUnlock(() => {
      setAudioUnlocked(isVideoAudioUnlocked())
    })
  }, [])

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
    if (!video) return
    video.pause()
    setIsPlaying(false)
    syncMutedState(true)
    videoPlaybackManager.release(playbackId)
  }, [playbackId, syncMutedState])

  const playVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || !canPlayRef.current || !isActiveRef.current) return

    const playPriority = priority ? 2 : viewportPriorityRef.current
    videoPlaybackManager.requestPlay(playbackId, playPriority, isTouch)

    if (!videoPlaybackManager.isAllowed(playbackId, isTouch)) return

    const staggerMs = videoPlaybackManager.getStaggerDelay(playbackId, isTouch)
    if (staggerMs > 0) {
      await new Promise<void>((r) => window.setTimeout(r, staggerMs))
    }

    if (!canPlayRef.current || !isActiveRef.current) return
    if (!videoPlaybackManager.isAllowed(playbackId, isTouch)) return

    if (wantsSoundRef.current && isVideoAudioUnlocked()) {
      const ok = await enableSound()
      if (ok) {
        clearStallTimer()
        return
      }
    }

    syncMutedState(true)
    const ok = await playVideoMuted(video)
    if (ok) {
      setIsPlaying(true)
      setShowStallHint(false)
      clearStallTimer()
    } else {
      setIsPlaying(false)
      videoPlaybackManager.release(playbackId)
    }
  }, [
    clearStallTimer,
    enableSound,
    isTouch,
    playbackId,
    priority,
    syncMutedState,
  ])

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
            void playVideoMuted(video).then((mutedOk) => {
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
        void playVideoMuted(video).then((ok) => {
          if (ok) setIsPlaying(true)
        })
        return
      }

      void enableSound()
    },
    [enableSound, formatValid, hasSound, isMuted, playbackId, syncMutedState, videoReady],
  )

  useEffect(() => {
    canPlayRef.current = shouldAttachVideo
    if (shouldAttachVideo && isActiveRef.current) {
      void playVideo()
    }
  }, [shouldAttachVideo, playVideo])

  useEffect(() => {
    isActiveRef.current = isActiveViewport
    if (isActiveViewport && canPlayRef.current) {
      void playVideo()
    } else {
      pauseVideo()
      const video = videoRef.current
      if (video) video.currentTime = 0
    }
  }, [isActiveViewport, pauseVideo, playVideo])

  useEffect(() => {
    return videoPlaybackManager.register(
      playbackId,
      () => pauseVideo(),
      () => {
        syncMutedState(true)
      },
    )
  }, [pauseVideo, playbackId, syncMutedState])

  useEffect(() => {
    retryCountRef.current = 0
    setVideoReady(false)
    setIsPlaying(false)
    setShowStallHint(false)
    setPosterReady(!resolvedPoster)
    wantsSoundRef.current = false
    syncMutedState(true)
    videoPlaybackManager.releaseAudio(playbackId)

    if (!resolvedPoster) {
      setPosterReady(true)
      return
    }

    const timer = window.setTimeout(() => setPosterReady(true), POSTER_READY_MS)
    return () => window.clearTimeout(timer)
  }, [videoUrl, resolvedPoster, syncMutedState, playbackId])

  useEffect(() => {
    if (!shouldAttachVideo || videoReady) {
      clearStallTimer()
      return
    }
    scheduleStallWatch()
    return clearStallTimer
  }, [shouldAttachVideo, videoReady, scheduleStallWatch, clearStallTimer])

  const { ref: containerRef } = useInViewport({
    observe: !priority,
    rootMargin: '100px 0px',
    threshold: [0, 0.15, ACTIVE_RATIO, 0.65],
    onIntersecting: (visible, ratio) => {
      const near = visible && ratio > 0.12
      const active = visible && ratio >= ACTIVE_RATIO
      viewportPriorityRef.current = priority ? 2 : ratio
      setIsNearViewport(priority || near)
      setIsActiveViewport(priority || active)
      if (active && canPlayRef.current) {
        videoPlaybackManager.requestPlay(playbackId, viewportPriorityRef.current, isTouch)
      }
    },
  })

  const handleVideoReady = useCallback(() => {
    setVideoReady(true)
    setShowStallHint(false)
    clearStallTimer()
    if (isActiveRef.current) void playVideo()
  }, [clearStallTimer, playVideo])

  const handleVideoError = useCallback(() => {
    setVideoReady(false)
    setIsPlaying(false)
    if (onVideoUnavailable) onVideoUnavailable()
  }, [onVideoUnavailable])

  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => setIsPlaying(false), [])

  const preload =
    priority || isActiveViewport ? 'metadata' : isNearViewport ? 'metadata' : 'none'

  const videoVisible = shouldAttachVideo && isPlaying && videoReady

  return {
    containerRef,
    videoRef,
    formatValid,
    shouldAttachVideo,
    resolvedPoster,
    preload,
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
    handleVideoError,
    handlePlay,
    handlePause,
  }
}
