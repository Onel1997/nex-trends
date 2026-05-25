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

/** Muted play — safe before user gesture. */
export async function playVideoMuted(video: HTMLVideoElement): Promise<boolean> {
  applyInlineVideoAttrs(video)
  video.muted = true
  video.setAttribute('muted', '')
  video.volume = 0
  try {
    if (video.readyState < 2) video.load()
    await video.play()
    return !video.paused
  } catch {
    return false
  }
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
