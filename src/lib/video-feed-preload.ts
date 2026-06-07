import { resolveAdaptiveVideoUrl } from '@/lib/video-url-adaptive'

export type VideoPreloadTier = 'hot' | 'warm' | 'metadata' | 'none'

const MAX_WARM_POOL = 4
const warmedUrls = new Set<string>()
const warmPool: HTMLVideoElement[] = []

function schedulePreloadWork(run: () => void): void {
  if (typeof window === 'undefined') return
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 100 })
    return
  }
  queueMicrotask(run)
}

function createWarmElement(url: string, tier: VideoPreloadTier): HTMLVideoElement {
  const video = document.createElement('video')
  video.preload = tier === 'hot' ? 'auto' : 'metadata'
  video.muted = true
  video.defaultMuted = true
  video.setAttribute('muted', '')
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', 'true')
  video.setAttribute('aria-hidden', 'true')
  video.style.cssText =
    'position:fixed;width:0;height:0;opacity:0;pointer-events:none;left:-9999px;top:-9999px'
  video.src = url
  return video
}

function recycleWarmElement(video: HTMLVideoElement): void {
  video.pause()
  video.removeAttribute('src')
  video.load()
}

/** Hidden element + HTTP cache warm — does not steal the visible playback slot. */
export function warmVideoUrl(
  rawUrl: string | undefined,
  tier: VideoPreloadTier,
): void {
  if (!rawUrl?.trim() || tier === 'none') return
  const url = resolveAdaptiveVideoUrl(rawUrl) ?? rawUrl.trim()
  if (warmedUrls.has(url)) return

  const runWarm = () => {
    if (warmedUrls.has(url)) return
    warmedUrls.add(url)

    while (warmPool.length >= MAX_WARM_POOL) {
      const old = warmPool.shift()
      if (old) recycleWarmElement(old)
    }

    const el = createWarmElement(url, tier)
    warmPool.push(el)
    el.load()

    if (tier === 'hot') {
      void el.play().then(() => {
        el.pause()
        el.currentTime = 0
      }).catch(() => {})
    }
  }

  /* Hot tier: run immediately so the first visible card is warm before IO fires */
  if (tier === 'hot') {
    runWarm()
    return
  }

  schedulePreloadWork(runWarm)
}

export function preloadPosterUrl(posterUrl: string | undefined): void {
  if (!posterUrl?.trim() || typeof window === 'undefined') return
  const img = new Image()
  img.decoding = 'async'
  img.src = posterUrl.trim()
}

export function clearVideoWarmCache(): void {
  warmedUrls.clear()
  for (const el of warmPool) recycleWarmElement(el)
  warmPool.length = 0
}

export function isVideoUrlWarmed(url: string | undefined): boolean {
  if (!url?.trim()) return false
  const resolved = resolveAdaptiveVideoUrl(url) ?? url.trim()
  return warmedUrls.has(resolved)
}
