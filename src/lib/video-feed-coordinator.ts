import {
  preloadPosterUrl,
  warmVideoUrl,
  type VideoPreloadTier,
} from '@/lib/video-feed-preload'
import { resolveAdaptiveVideoUrl } from '@/lib/video-url-adaptive'

type FeedEntry = {
  index: number
  videoUrl?: string
  posterUrl?: string
}

const ACTIVE_RATIO = 0.32

let feedEntries: FeedEntry[] = []
let activeIndex = 0
const visibilityRatios = new Map<number, number>()
const listeners = new Set<(active: number) => void>()

function notifyActiveIndex(): void {
  for (const fn of listeners) {
    try {
      fn(activeIndex)
    } catch {
      /* ignore */
    }
  }
}

export function tierForFeedIndex(index: number, active: number): VideoPreloadTier {
  const delta = index - active
  if (delta === 0) return 'hot'
  if (delta === 1 || delta === 2 || delta === -1) return 'warm'
  if (delta >= -3 && delta <= 4) return 'metadata'
  return 'none'
}

function pickActiveIndex(): number {
  let best = activeIndex
  let bestRatio = visibilityRatios.get(best) ?? 0
  for (const [idx, ratio] of visibilityRatios) {
    if (ratio > bestRatio) {
      bestRatio = ratio
      best = idx
    }
  }
  if (bestRatio < ACTIVE_RATIO) return activeIndex
  return best
}

function scheduleAheadPreload(active: number): void {
  const indices = [active, active + 1, active + 2, active - 1]
  const seen = new Set<string>()

  for (const idx of indices) {
    if (idx < 0 || idx >= feedEntries.length) continue
    const entry = feedEntries[idx]
    const url = entry.videoUrl?.trim()
    if (!url || seen.has(url)) continue
    seen.add(url)

    const tier = tierForFeedIndex(idx, active)
    warmVideoUrl(url, tier)
    if (entry.posterUrl) preloadPosterUrl(entry.posterUrl)
  }
}

export const videoFeedCoordinator = {
  setFeed(entries: FeedEntry[]): void {
    feedEntries = entries
    visibilityRatios.clear()
    const firstPlayable = entries.findIndex((e) => e.videoUrl?.trim())
    activeIndex = firstPlayable >= 0 ? firstPlayable : 0
    visibilityRatios.set(activeIndex, 1)
    scheduleAheadPreload(activeIndex)
    notifyActiveIndex()
  },

  reportVisibility(
    index: number,
    ratio: number,
    videoUrl?: string,
    posterUrl?: string,
  ): void {
    if (index >= 0 && index < feedEntries.length) {
      feedEntries[index] = {
        index,
        videoUrl: videoUrl ? resolveAdaptiveVideoUrl(videoUrl) : undefined,
        posterUrl,
      }
    }

    visibilityRatios.set(index, ratio)

    const nextActive = pickActiveIndex()
    if (nextActive !== activeIndex) {
      activeIndex = nextActive
      scheduleAheadPreload(activeIndex)
      notifyActiveIndex()
    } else if (ratio >= ACTIVE_RATIO && index === activeIndex) {
      scheduleAheadPreload(activeIndex)
    }
  },

  getActiveIndex(): number {
    return activeIndex
  },

  subscribeActiveIndex(listener: (active: number) => void): () => void {
    listeners.add(listener)
    listener(activeIndex)
    return () => listeners.delete(listener)
  },

  bootstrapFeed(urls: Array<{ videoUrl?: string; posterUrl?: string }>): void {
    this.setFeed(
      urls.map((u, index) => ({
        index,
        videoUrl: u.videoUrl,
        posterUrl: u.posterUrl,
      })),
    )
  },
}
