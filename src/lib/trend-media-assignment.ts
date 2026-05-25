import {
  getAssetsForNiche,
  type DemoMediaAsset,
  isPlayableDemoPosterUrl,
  isPlayableDemoVideoUrl,
  isTrustedDemoVideoUrl,
  posterForVideoUrl,
} from '@/lib/demo-media'
import type { DemoCatalogNiche } from '@/lib/demo-catalog-niches'
import { isVideoInNichePool, resolveMediaNiche } from '@/lib/demo-media-niches'
import { hashString } from '@/lib/demo-trend-seed'
import { isLocalDemoVideo } from '@/lib/video-url'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const VIDEO_STEP = 13

/** URLs that failed at runtime in this session — skip when assigning fallbacks */
const runtimeFailedVideos = new Set<string>()

export function markDemoVideoFailed(url: string | undefined): void {
  if (url?.trim()) runtimeFailedVideos.add(url.trim())
}

export function isRuntimeFailedVideo(url: string | undefined): boolean {
  return Boolean(url?.trim() && runtimeFailedVideos.has(url.trim()))
}

export function clearRuntimeFailedVideos(): void {
  runtimeFailedVideos.clear()
}

function isAssignableVideo(url: string | undefined): boolean {
  if (!url?.trim() || isRuntimeFailedVideo(url)) return false
  return isPlayableDemoVideoUrl(url)
}

function isAssignablePoster(url: string | undefined): boolean {
  if (!url?.trim()) return false
  return isPlayableDemoPosterUrl(url)
}

function nichePool(niche?: string): DemoMediaAsset[] {
  return getAssetsForNiche(resolveMediaNiche(niche))
}

function pickFromNichePool(
  niche: DemoCatalogNiche,
  slot: number,
  usedVideos: Set<string>,
  usedThumbnails: Set<string>,
  seed = 0,
): DemoMediaAsset | null {
  const pool = nichePool(niche)
  if (pool.length === 0) return null

  for (let offset = 0; offset < pool.length; offset += 1) {
    const index = (slot * VIDEO_STEP + seed + offset * 7) % pool.length
    const media = pool[index]
    if (
      isAssignableVideo(media.video) &&
      isAssignablePoster(media.poster) &&
      !usedVideos.has(media.video) &&
      !usedThumbnails.has(media.poster)
    ) {
      return media
    }
  }

  for (let offset = 0; offset < pool.length; offset += 1) {
    const index = (slot + offset) % pool.length
    const media = pool[index]
    if (isAssignableVideo(media.video) && isAssignablePoster(media.poster)) {
      return media
    }
  }

  return null
}

export function buildCatalogMediaSlot(slot: number, niche?: string): DemoMediaAsset {
  const resolved = resolveMediaNiche(niche)
  const usedVideos = new Set<string>()
  const usedThumbnails = new Set<string>()
  const media =
    pickFromNichePool(resolved, slot, usedVideos, usedThumbnails, hashString(String(slot))) ??
    nichePool(resolved)[slot % nichePool(resolved).length]
  return media
}

export function resolveUniqueCatalogMedia(
  slot: number,
  niche: string | undefined,
  usedVideos: Set<string>,
  usedThumbnails: Set<string>,
  seed = 0,
): DemoMediaAsset {
  const resolved = resolveMediaNiche(niche)
  const media =
    pickFromNichePool(resolved, slot, usedVideos, usedThumbnails, seed) ??
    buildCatalogMediaSlot(slot + seed, niche)

  usedVideos.add(media.video)
  usedThumbnails.add(media.poster)
  return media
}

/** Stable media for a trend id (deterministic slot, niche-aware). */
export function getStableTrendMedia(trendId: string, niche?: string): DemoMediaAsset {
  const resolved = resolveMediaNiche(niche)
  const slot = hashString(`${trendId}:${resolved}`) % 997
  return buildCatalogMediaSlot(slot, niche)
}

/** Stable per-trend order: local MP4s first, then seeded rotation within the niche pool. */
export function getMediaFallbackChain(
  trendId: string,
  niche: string | undefined,
  excludeVideos: ReadonlySet<string> = new Set(),
): DemoMediaAsset[] {
  const resolved = resolveMediaNiche(niche)
  const pool = nichePool(resolved)
  const seed = hashString(`${trendId}:${resolved}`)
  const local: DemoMediaAsset[] = []
  const remote: DemoMediaAsset[] = []

  for (let i = 0; i < pool.length; i += 1) {
    const asset = pool[(seed + i * VIDEO_STEP) % pool.length]
    if (excludeVideos.has(asset.video) || !isAssignableVideo(asset.video)) continue
    if (isLocalDemoVideo(asset.video)) local.push(asset)
    else remote.push(asset)
  }

  return [...local, ...remote]
}

export function pickNextFallbackMedia(
  trendId: string,
  niche: string | undefined,
  failedVideo: string | undefined,
  excludeVideos: ReadonlySet<string>,
): DemoMediaAsset {
  if (failedVideo) markDemoVideoFailed(failedVideo)

  const exclude = new Set(excludeVideos)
  if (failedVideo) exclude.add(failedVideo)

  const chain = getMediaFallbackChain(trendId, niche, exclude)
  if (chain.length > 0) {
    const slot = hashString(`${trendId}:${failedVideo ?? 'init'}`) % chain.length
    return chain[slot]
  }

  return getStableTrendMedia(`${trendId}:emergency`, niche)
}

type UsedMedia = {
  videos: Set<string>
  thumbnails: Set<string>
  creators: Set<string>
}

function createUsedMedia(): UsedMedia {
  return { videos: new Set(), thumbnails: new Set(), creators: new Set() }
}

function isTrendMediaValid(trend: TrendIntelligence): boolean {
  const video = trend.videoUrl?.trim() ?? ''
  const thumb = trend.thumbnailUrl?.trim() ?? ''
  const creator = trend.creator?.handle?.trim() ?? ''
  if (!video || !thumb || !creator) return false
  if (!isAssignableVideo(video) || !isAssignablePoster(thumb)) return false
  const expectedPoster = posterForVideoUrl(video)
  if (expectedPoster && thumb !== expectedPoster) return false
  const resolved = resolveMediaNiche(trend.niche)
  if (!isVideoInNichePool(video, resolved)) return false
  return true
}

function isTrendMediaUnique(trend: TrendIntelligence, used: UsedMedia): boolean {
  if (!isTrendMediaValid(trend)) return false
  const video = trend.videoUrl!.trim()
  const thumb = trend.thumbnailUrl!.trim()
  const creator = trend.creator!.handle!.trim()
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
  const resolved = resolveMediaNiche(trend.niche)
  const pool = nichePool(resolved)

  for (let attempt = 0; attempt < pool.length; attempt += 1) {
    const index = (slot * VIDEO_STEP + seed + attempt * 7) % pool.length
    const base = pool[index]
    if (!isAssignableVideo(base.video) || !isAssignablePoster(base.poster)) continue
    const creator = trend.creator?.handle?.trim() ?? ''

    if (used.videos.has(base.video) || used.thumbnails.has(base.poster)) continue
    if (creator && used.creators.has(creator)) continue

    return {
      ...trend,
      thumbnailUrl: base.poster,
      videoUrl: base.video,
      videoDuration: base.duration,
    }
  }

  const media = buildCatalogMediaSlot(slot + seed, trend.niche)
  return {
    ...trend,
    thumbnailUrl: media.poster,
    videoUrl: media.video,
    videoDuration: media.duration,
  }
}

/** Re-assign verified MP4 + poster when URLs are missing, blocked, or off-niche. */
export function sanitizeTrendMedia(
  trend: TrendIntelligence,
  index = 0,
): TrendIntelligence {
  if (isTrendMediaValid(trend)) return trend

  const slot = hashString(`${trend.id}:${index}`) % 997
  const media = buildCatalogMediaSlot(slot, trend.niche)
  return {
    ...trend,
    thumbnailUrl: media.poster,
    videoUrl: media.video,
    videoDuration: media.duration ?? trend.videoDuration,
  }
}

/** Guarantees unique video/thumbnail/creator within a feed batch (stable for same seed). */
export function ensureFeedMediaDiversity(
  trends: TrendIntelligence[],
  seed = 0,
): TrendIntelligence[] {
  const used = createUsedMedia()

  return trends.map((trend, index) => {
    const sanitized = sanitizeTrendMedia(trend, index)
    if (isTrendMediaUnique(sanitized, used)) {
      registerTrendMedia(sanitized, used)
      return sanitized
    }

    const remapped = remapTrendMedia(sanitized, index, seed, used)
    registerTrendMedia(remapped, used)
    return remapped
  })
}

export { isTrustedDemoVideoUrl }
