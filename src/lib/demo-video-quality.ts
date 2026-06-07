const MIXKIT_ID_PATTERN = /mixkit\.co\/videos\/(\d+)/

export function mixkitIdFromVideoUrl(url: string): number | null {
  const match = url.match(MIXKIT_ID_PATTERN)
  return match ? Number(match[1]) : null
}

/** Broken, 403, or consistently unusable */
export const BLOCKED_MIXKIT_IDS = new Set([
  2766, 1361, 1418, 1430, 1605, 1620, 1680, 2324,
  100545, 100541, 100551,
])

/**
 * Dark, overly abstract, or static-prone clips removed from rotation.
 * @see scripts/validate-demo-media.mjs
 */
export const QUALITY_BLOCKED_MIXKIT_IDS = new Set([
  805, 809, 3456, 5201, 9060,
  2578, 2466, 2499, 2580, 30012, 3372, 50972,
])

/** Prefer brighter, action-forward poster frames (Mixkit thumb index). */
export const MIXKIT_POSTER_INDEX: Readonly<Record<number, number>> = {
  47779: 3,
  47770: 3,
  52270: 3,
  52280: 0,
  4059: 1,
  44541: 0,
  50641: 1,
  23327: 0,
  42298: 1,
}

/** Skip dark or empty lead-ins (seconds). */
export const MIXKIT_PLAYBACK_START_SEC: Readonly<Record<number, number>> = {
  47779: 0.4,
  47770: 0.35,
  52270: 0.2,
  805: 0.5,
  809: 0.5,
  3456: 0.45,
  5201: 0.4,
  9060: 0.35,
}

export const DEFAULT_MIXKIT_POSTER_INDEX = 0
export const DEFAULT_PLAYBACK_START_SEC = 0.12

/** Minimum average luma (0–255) for poster + first video frame */
export const MIN_LUMA_THRESHOLD = 32

/** Minimum mean absolute frame delta to treat clip as having motion */
export const MIN_MOTION_DELTA = 2.25

const POSTER_INDEX_FALLBACK = [3, 1, 2, 0] as const

export function isBlockedMixkitId(id: number): boolean {
  return BLOCKED_MIXKIT_IDS.has(id) || QUALITY_BLOCKED_MIXKIT_IDS.has(id)
}

export function getMixkitPosterIndex(id: number): number {
  return MIXKIT_POSTER_INDEX[id] ?? DEFAULT_MIXKIT_POSTER_INDEX
}

export function mixkitPosterUrl(id: number, index?: number): string {
  const idx = index ?? getMixkitPosterIndex(id)
  return `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-${idx}.jpg`
}

export function mixkitPosterCandidates(id: number): string[] {
  const preferred = getMixkitPosterIndex(id)
  const order = [preferred, ...POSTER_INDEX_FALLBACK.filter((i) => i !== preferred)]
  return order.map((i) => mixkitPosterUrl(id, i))
}

export function mixkitVideoUrl(id: number): string {
  return `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`
}

export function getPlaybackStartOffset(videoUrl: string | undefined): number {
  const id = mixkitIdFromVideoUrl(videoUrl ?? '')
  if (id == null) return 0
  return MIXKIT_PLAYBACK_START_SEC[id] ?? DEFAULT_PLAYBACK_START_SEC
}

export function isQualityBlockedVideoUrl(videoUrl: string | undefined): boolean {
  const id = mixkitIdFromVideoUrl(videoUrl ?? '')
  return id != null && isBlockedMixkitId(id)
}

/** Average RGB → luma (0–255) from ImageData */
export function averageLumaFromImageData(data: Uint8ClampedArray): number {
  let sum = 0
  const pixels = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return pixels > 0 ? sum / pixels : 0
}

/** Mean absolute difference between two same-size frames (motion proxy). */
export function frameMotionDelta(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
  const n = Math.min(a.length, b.length) / 4
  if (n === 0) return 0
  let sum = 0
  for (let i = 0; i < a.length && i < b.length; i += 4) {
    const la = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]
    const lb = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2]
    sum += Math.abs(la - lb)
  }
  return sum / n
}
