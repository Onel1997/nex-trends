import {
  DEMO_MEDIA_ASSETS,
  type DemoMediaAsset,
  posterForCatalogSlot,
  videoIndexForCatalogSlot,
} from '@/lib/demo-media'
import { hashString } from '@/lib/demo-trend-seed'
import { isLocalDemoVideo } from '@/lib/video-url'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const VIDEO_STEP = 17

export function buildCatalogMediaSlot(slot: number): DemoMediaAsset {
  const videoIndex = videoIndexForCatalogSlot(slot)
  const base = DEMO_MEDIA_ASSETS[videoIndex]
  return {
    video: base.video,
    poster: posterForCatalogSlot(slot, videoIndex),
    duration: base.duration,
  }
}

export function resolveUniqueCatalogMedia(
  slot: number,
  usedVideos: Set<string>,
  usedThumbnails: Set<string>,
): DemoMediaAsset {
  const poolSize = DEMO_MEDIA_ASSETS.length
  for (let offset = 0; offset < poolSize; offset += 1) {
    const media = buildCatalogMediaSlot(slot + offset)
    if (!usedVideos.has(media.video) && !usedThumbnails.has(media.poster)) {
      usedVideos.add(media.video)
      usedThumbnails.add(media.poster)
      return media
    }
  }

  const fallback = buildCatalogMediaSlot(slot)
  usedVideos.add(fallback.video)
  usedThumbnails.add(fallback.poster)
  return fallback
}

/** Stable per-trend order: local MP4s first, then seeded CDN rotation. */
export function getMediaFallbackChain(
  trendId: string,
  excludeVideos: ReadonlySet<string> = new Set(),
): DemoMediaAsset[] {
  const seed = hashString(trendId)
  const local: DemoMediaAsset[] = []
  const remote: DemoMediaAsset[] = []

  for (let i = 0; i < DEMO_MEDIA_ASSETS.length; i += 1) {
    const asset = DEMO_MEDIA_ASSETS[(seed + i * VIDEO_STEP) % DEMO_MEDIA_ASSETS.length]
    if (excludeVideos.has(asset.video)) continue
    if (isLocalDemoVideo(asset.video)) local.push(asset)
    else remote.push(asset)
  }

  return [...local, ...remote]
}

export function pickNextFallbackMedia(
  trendId: string,
  failedVideo: string | undefined,
  excludeVideos: ReadonlySet<string>,
): DemoMediaAsset | null {
  const exclude = new Set(excludeVideos)
  if (failedVideo) exclude.add(failedVideo)

  const chain = getMediaFallbackChain(trendId, exclude)
  if (chain.length === 0) return null

  const slot = hashString(`${trendId}:${failedVideo ?? 'init'}`) % chain.length
  const base = chain[slot]
  return {
    ...base,
    poster: posterForCatalogSlot(hashString(trendId) % 997, hashString(base.video) % DEMO_MEDIA_ASSETS.length),
  }
}

type UsedMedia = {
  videos: Set<string>
  thumbnails: Set<string>
  creators: Set<string>
}

function createUsedMedia(): UsedMedia {
  return { videos: new Set(), thumbnails: new Set(), creators: new Set() }
}

function isTrendMediaUnique(trend: TrendIntelligence, used: UsedMedia): boolean {
  const video = trend.videoUrl?.trim() ?? ''
  const thumb = trend.thumbnailUrl?.trim() ?? ''
  const creator = trend.creator?.handle?.trim() ?? ''
  if (!video || !thumb || !creator) return false
  if (used.videos.has(video) || used.thumbnails.has(thumb) || used.creators.has(creator)) {
    return false
  }
  return true
}

function registerTrendMedia(trend: TrendIntelligence, used: UsedMedia): void {
  const video = trend.videoUrl?.trim()
  const thumb = trend.thumbnailUrl?.trim()
  const creator = trend.creator?.handle?.trim()
  if (video) used.videos.add(video)
  if (thumb) used.thumbnails.add(thumb)
  if (creator) used.creators.add(creator)
}

function remapTrendMedia(
  trend: TrendIntelligence,
  slot: number,
  seed: number,
  used: UsedMedia,
): TrendIntelligence {
  const poolSize = DEMO_MEDIA_ASSETS.length
  for (let attempt = 0; attempt < poolSize; attempt += 1) {
    const index = (slot * VIDEO_STEP + seed + attempt * 13) % poolSize
    const base = DEMO_MEDIA_ASSETS[index]
    const poster = posterForCatalogSlot(slot + seed + attempt, index)
    const creator = trend.creator?.handle?.trim() ?? ''

    if (used.videos.has(base.video) || used.thumbnails.has(poster)) continue
    if (creator && used.creators.has(creator)) continue

    return {
      ...trend,
      thumbnailUrl: poster,
      videoUrl: base.video,
      videoDuration: base.duration,
    }
  }

  const media = buildCatalogMediaSlot(slot + seed)
  return {
    ...trend,
    thumbnailUrl: media.poster,
    videoUrl: media.video,
    videoDuration: media.duration,
  }
}

/** Guarantees unique video/thumbnail/creator within a feed batch (stable for same seed). */
export function ensureFeedMediaDiversity(
  trends: TrendIntelligence[],
  seed = 0,
): TrendIntelligence[] {
  const used = createUsedMedia()

  return trends.map((trend, index) => {
    if (isTrendMediaUnique(trend, used)) {
      registerTrendMedia(trend, used)
      return trend
    }

    const remapped = remapTrendMedia(trend, index, seed, used)
    registerTrendMedia(remapped, used)
    return remapped
  })
}
