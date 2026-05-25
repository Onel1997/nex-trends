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

const HAVE_CURRENT_DATA = 2
const MEDIA_WAIT_MS = 4_000
const PLAY_PROMISE_MS = 800

/** Muted play — safe before user gesture. */
export async function playVideoMuted(video: HTMLVideoElement): Promise<boolean> {
  return playVideoMutedFast(video)
}

function waitForPlaybackData(
  video: HTMLVideoElement,
  tag: string,
): Promise<boolean> {
  if (video.readyState >= HAVE_CURRENT_DATA) return Promise.resolve(true)

  return new Promise((resolve) => {
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
      video.removeEventListener('loadedmetadata', onReady)
      resolve(ok)
    }

    const onReady = () => {
      logVideoPlayback('video loaded', {
        tag,
        readyState: video.readyState,
      })
      finish(true)
    }

    const timer = window.setTimeout(() => {
      logVideoPlayback('video load timeout', { tag, readyState: video.readyState })
      finish(false)
    }, MEDIA_WAIT_MS)

    video.addEventListener('loadeddata', onReady, { once: true })
    video.addEventListener('canplay', onReady, { once: true })
    video.addEventListener('loadedmetadata', onReady, { once: true })
    if (video.readyState < HAVE_CURRENT_DATA) video.load()
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
): Promise<boolean> {
  const hasData = await waitForPlaybackData(video, tag)
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

  try {
    if (video.paused) {
      if (video.readyState < 2) video.load()
      await video.play()
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
