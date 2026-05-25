import {
  averageLumaFromImageData,
  frameMotionDelta,
  getPlaybackStartOffset,
  MIN_LUMA_THRESHOLD,
  MIN_MOTION_DELTA,
} from '@/lib/demo-video-quality'

export type VideoQualityProbeResult = {
  ok: boolean
  reason?: 'dark' | 'static' | 'error' | 'timeout'
}

const probeCache = new Map<string, VideoQualityProbeResult>()
const PROBE_SAMPLE_SIZE = 48

function cacheKey(url: string): string {
  return url.trim()
}

export function getCachedVideoQualityProbe(url: string): VideoQualityProbeResult | undefined {
  return probeCache.get(cacheKey(url))
}

export function setCachedVideoQualityProbe(url: string, result: VideoQualityProbeResult): void {
  probeCache.set(cacheKey(url), result)
}

function waitForVideoEvent(video: HTMLVideoElement, event: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('timeout'))
    }, timeoutMs)

    const onOk = () => {
      cleanup()
      resolve()
    }

    const cleanup = () => {
      window.clearTimeout(timer)
      video.removeEventListener(event, onOk)
      video.removeEventListener('error', onErr)
    }

    const onErr = () => {
      cleanup()
      reject(new Error('error'))
    }

    video.addEventListener(event, onOk, { once: true })
    video.addEventListener('error', onErr, { once: true })
  })
}

async function seekAndSample(
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  time: number,
): Promise<Uint8ClampedArray> {
  video.currentTime = time
  await waitForVideoEvent(video, 'seeked', 4000)
  ctx.drawImage(video, 0, 0, PROBE_SAMPLE_SIZE, PROBE_SAMPLE_SIZE)
  return ctx.getImageData(0, 0, PROBE_SAMPLE_SIZE, PROBE_SAMPLE_SIZE).data
}

/**
 * Samples 2 frames in the first ~1.2s (after playback offset) for luma + motion.
 * Results are cached per URL for the session.
 */
export async function probeVideoPlaybackQuality(
  video: HTMLVideoElement,
  videoUrl: string,
): Promise<VideoQualityProbeResult> {
  const key = cacheKey(videoUrl)
  const cached = probeCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = PROBE_SAMPLE_SIZE
  canvas.height = PROBE_SAMPLE_SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    const fail = { ok: false, reason: 'error' as const }
    probeCache.set(key, fail)
    return fail
  }

  try {
    if (video.readyState < 1) {
      await waitForVideoEvent(video, 'loadedmetadata', 5000)
    }

    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 8
    const start = Math.min(getPlaybackStartOffset(videoUrl), Math.max(0, duration - 1.5))
    const t1 = Math.min(start + 0.35, duration - 0.05)
    const t2 = Math.min(start + 0.95, duration - 0.05)

    const frameA = await seekAndSample(video, ctx, start)
    const lumaA = averageLumaFromImageData(frameA)
    if (lumaA < MIN_LUMA_THRESHOLD) {
      const fail = { ok: false, reason: 'dark' as const }
      probeCache.set(key, fail)
      return fail
    }

    const frameB = await seekAndSample(video, ctx, t1)
    const frameC = await seekAndSample(video, ctx, t2)
    const motion = Math.max(
      frameMotionDelta(frameA, frameB),
      frameMotionDelta(frameB, frameC),
    )

    if (motion < MIN_MOTION_DELTA) {
      const fail = { ok: false, reason: 'static' as const }
      probeCache.set(key, fail)
      return fail
    }

    const ok = { ok: true as const }
    probeCache.set(key, ok)
    return ok
  } catch {
    const fail = { ok: false, reason: 'error' as const }
    probeCache.set(key, fail)
    return fail
  }
}

/** Probe poster image brightness before showing thumbnail. */
export async function probePosterQuality(posterUrl: string): Promise<VideoQualityProbeResult> {
  const key = `poster:${cacheKey(posterUrl)}`
  const cached = probeCache.get(key)
  if (cached) return cached

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const fail = (reason: VideoQualityProbeResult['reason']) => {
      const result = { ok: false, reason }
      probeCache.set(key, result)
      resolve(result)
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = PROBE_SAMPLE_SIZE
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          fail('error')
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        const luma = averageLumaFromImageData(
          ctx.getImageData(0, 0, size, size).data,
        )
        if (luma < MIN_LUMA_THRESHOLD) {
          fail('dark')
          return
        }
        const ok = { ok: true as const }
        probeCache.set(key, ok)
        resolve(ok)
      } catch {
        const ok = { ok: true as const }
        probeCache.set(key, ok)
        resolve(ok)
      }
    }

    img.onerror = () => fail('error')
    img.src = posterUrl
  })
}
