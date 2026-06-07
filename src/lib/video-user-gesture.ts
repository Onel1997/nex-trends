/** Global iOS Safari audio unlock — HTML5 video only, no AudioContext. */

let audioUnlocked = false
const listeners = new Set<() => void>()

function notify() {
  for (const fn of listeners) {
    try {
      fn()
    } catch {
      /* ignore */
    }
  }
}

export function markVideoUserGesture(): void {
  if (audioUnlocked) return
  audioUnlocked = true
  notify()
}

export function isVideoAudioUnlocked(): boolean {
  return audioUnlocked
}

export function subscribeVideoAudioUnlock(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function applyInlineVideoAttrs(video: HTMLVideoElement): void {
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', 'true')
}

import { logVideoPlayback } from '@/lib/video-playback-log'

const HAVE_METADATA = 1
const HAVE_CURRENT_DATA = 2
const MEDIA_WAIT_MS = 4_000
const FAST_START_WAIT_MS = 1_800
const PLAY_PROMISE_MS = 800

export type PlayVideoMutedFastOptions = {
  /** Resolve on canplay — do not wait for full buffer */
  fastStart?: boolean
}

/** Muted play — safe before user gesture. */
export async function playVideoMuted(video: HTMLVideoElement): Promise<boolean> {
  return playVideoMutedFast(video)
}

function waitForPlaybackData(
  video: HTMLVideoElement,
  tag: string,
  fastStart = false,
): Promise<boolean> {
  const minReady = fastStart ? HAVE_METADATA : HAVE_CURRENT_DATA
  if (video.readyState >= minReady) return Promise.resolve(true)

  return new Promise((resolve) => {
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('loadedmetadata', onReady)
      resolve(ok)
    }

    const onReady = () => {
      logVideoPlayback('video loaded', {
        tag,
        src: video.currentSrc || video.src,
        readyState: video.readyState,
        fastStart,
      })
      finish(true)
    }

    const onCanPlay = () => {
      logVideoPlayback('canplay (wait)', {
        tag,
        src: video.currentSrc || video.src,
        readyState: video.readyState,
      })
      if (fastStart || video.readyState >= HAVE_CURRENT_DATA) {
        finish(true)
      }
    }

    const timer = window.setTimeout(() => {
      logVideoPlayback('video load timeout', { tag, readyState: video.readyState })
      finish(video.readyState >= minReady)
    }, fastStart ? FAST_START_WAIT_MS : MEDIA_WAIT_MS)

    video.addEventListener('canplay', onCanPlay, { once: true })
    if (!fastStart) {
      video.addEventListener('loadeddata', onReady, { once: true })
      video.addEventListener('loadedmetadata', onReady, { once: true })
    }
    if (video.readyState < minReady) video.load()
  })
}

async function attemptMutedPlay(
  video: HTMLVideoElement,
  tag: string,
): Promise<boolean> {
  applyInlineVideoAttrs(video)
  video.muted = true
  video.setAttribute('muted', '')
  video.volume = 0
  video.autoplay = true
  video.setAttribute('autoplay', '')

  const src = video.currentSrc || video.src
  logVideoPlayback('play() call', { tag, src, paused: video.paused, readyState: video.readyState })

  try {
    const playPromise = video.play()
    const result = await Promise.race([
      playPromise.then(() => !video.paused),
      new Promise<boolean>((resolve) => {
        window.setTimeout(() => resolve(false), PLAY_PROMISE_MS)
      }),
    ])
    logVideoPlayback(result ? 'play success' : 'play timeout', {
      tag,
      paused: video.paused,
      readyState: video.readyState,
    })
    return result
  } catch (err) {
    logVideoPlayback('play failure', {
      tag,
      error: err instanceof Error ? err.message : String(err),
      readyState: video.readyState,
    })
    return false
  }
}

/**
 * Wait for first-frame data, then call play() — does not abort load at 300ms.
 */
export async function playVideoMutedFast(
  video: HTMLVideoElement,
  tag = 'feed',
  options: PlayVideoMutedFastOptions = {},
): Promise<boolean> {
  const { fastStart = false } = options
  const src = video.currentSrc || video.src
  logVideoPlayback('playVideoMutedFast start', {
    tag,
    src,
    readyState: video.readyState,
    fastStart,
  })

  if (!video.currentSrc && !video.src && src) {
    video.src = src
  }
  video.preload = 'auto'
  if (video.readyState < (fastStart ? HAVE_METADATA : HAVE_CURRENT_DATA)) {
    video.load()
    logVideoPlayback('video.load()', { tag, src: video.currentSrc || video.src })
  }

  const hasData = await waitForPlaybackData(video, tag, fastStart)
  if (!hasData) return false
  return attemptMutedPlay(video, tag)
}

/**
 * Unmuted playback — must run synchronously inside tap/click handler (iOS Safari).
 * Uses muted-then-unmute fallback when direct unmuted play is blocked.
 */
export async function playVideoWithSound(video: HTMLVideoElement): Promise<boolean> {
  markVideoUserGesture()
  applyInlineVideoAttrs(video)

  video.muted = false
  video.removeAttribute('muted')
  video.volume = 1

  const src = video.currentSrc || video.src
  logVideoPlayback('playVideoWithSound', { src, paused: video.paused, readyState: video.readyState })

  try {
    if (video.paused) {
      if (video.readyState < 2) {
        video.load()
        logVideoPlayback('video.load() (sound)', { src: video.currentSrc || video.src })
      }
      await video.play()
      logVideoPlayback('play() resolved (sound)', { src, paused: video.paused, muted: video.muted })
    }
    if (!video.paused && !video.muted) return true
  } catch {
    /* direct unmuted failed — try iOS unlock sequence */
  }

  try {
    video.muted = true
    video.setAttribute('muted', '')
    if (video.paused) await video.play()
    video.muted = false
    video.removeAttribute('muted')
    video.volume = 1
    if (video.paused) await video.play()
    return !video.paused && !video.muted
  } catch {
    video.muted = true
    video.setAttribute('muted', '')
    return false
  }
}

/** First card tap: unlock via brief muted play, then optional unmute. */
export async function unlockVideoAudioOnCard(
  video: HTMLVideoElement,
  withSound: boolean,
): Promise<boolean> {
  markVideoUserGesture()
  applyInlineVideoAttrs(video)

  if (!withSound) {
    return playVideoMuted(video)
  }

  return playVideoWithSound(video)
}

export function initVideoUserGestureListeners(): () => void {
  if (typeof window === 'undefined') return () => {}

  const unlock = () => markVideoUserGesture()

  window.addEventListener('pointerdown', unlock, { passive: true, capture: true })
  window.addEventListener('touchend', unlock, { passive: true, capture: true })

  return () => {
    window.removeEventListener('pointerdown', unlock, { capture: true })
    window.removeEventListener('touchend', unlock, { capture: true })
  }
}
