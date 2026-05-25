/** Self-hosted + CDN vertical clips for demo variety (Mixkit License where noted). */

import {
  getAllNicheMixkitIds,
  LOCAL_MEDIA_BY_NICHE,
  NICHE_MIXKIT_IDS,
} from '@/lib/demo-media-niches'
import type { DemoCatalogNiche } from '@/lib/demo-catalog-niches'
import {
  isBlockedMixkitId,
  isQualityBlockedVideoUrl,
  mixkitPosterUrl,
  mixkitVideoUrl,
} from '@/lib/demo-video-quality'

export type DemoMediaAsset = {
  video: string
  poster: string
  duration: string
  mixkitId?: number
  niches?: readonly DemoCatalogNiche[]
}

const MIXKIT_DURATIONS = [
  '0:12',
  '0:15',
  '0:18',
  '0:10',
  '0:14',
  '0:16',
  '0:11',
  '0:13',
  '0:09',
  '0:20',
  '0:22',
  '0:08',
  '0:17',
  '0:19',
] as const

function mixkitClip(id: number, durationIndex: number): DemoMediaAsset {
  const duration = MIXKIT_DURATIONS[durationIndex % MIXKIT_DURATIONS.length]
  return {
    video: mixkitVideoUrl(id),
    poster: mixkitPosterUrl(id),
    duration,
    mixkitId: id,
  }
}

const LOCAL_DEMO_META: Record<
  `/demo-videos/${string}.mp4`,
  { poster: string; duration: string; niche: DemoCatalogNiche }
> = {
  '/demo-videos/demo-1.mp4': {
    poster: '/demo-videos/demo-1-poster.jpg',
    duration: '0:12',
    niche: 'Productivity',
  },
  '/demo-videos/demo-2.mp4': {
    poster: '/demo-videos/demo-2-poster.jpg',
    duration: '0:18',
    niche: 'Business',
  },
  '/demo-videos/demo-3.mp4': {
    poster: '/demo-videos/demo-3-poster.jpg',
    duration: '0:15',
    niche: 'Fashion',
  },
  '/demo-videos/demo-4.mp4': {
    poster: '/demo-videos/demo-4-poster.jpg',
    duration: '0:10',
    niche: 'Food',
  },
}

/** Self-hosted clips — preferred for autoplay / mobile Safari */
export const LOCAL_DEMO_MEDIA: readonly DemoMediaAsset[] = Object.entries(LOCAL_DEMO_META).map(
  ([video, meta]) => ({
    video: video as `/demo-videos/${string}.mp4`,
    poster: meta.poster,
    duration: meta.duration,
    niches: [meta.niche] as const,
  }),
)

const MIXKIT_ID_TO_NICHES = new Map<number, DemoCatalogNiche[]>()
for (const niche of Object.keys(NICHE_MIXKIT_IDS) as DemoCatalogNiche[]) {
  for (const id of NICHE_MIXKIT_IDS[niche]) {
    const list = MIXKIT_ID_TO_NICHES.get(id) ?? []
    if (!list.includes(niche)) list.push(niche)
    MIXKIT_ID_TO_NICHES.set(id, list)
  }
}

const UNIQUE_MIXKIT_IDS = getAllNicheMixkitIds().filter((id) => !isBlockedMixkitId(id))

const MIXKIT_REMOTE_ASSETS: DemoMediaAsset[] = UNIQUE_MIXKIT_IDS.map((id, index) => {
  const asset = mixkitClip(id, index + 2)
  return { ...asset, niches: MIXKIT_ID_TO_NICHES.get(id) ?? [] }
})

export const DEMO_MEDIA_ASSETS: readonly DemoMediaAsset[] = [
  ...LOCAL_DEMO_MEDIA,
  ...MIXKIT_REMOTE_ASSETS,
] as const

const PLAYABLE_VIDEO_URLS = new Set(DEMO_MEDIA_ASSETS.map((a) => a.video))
const PLAYABLE_POSTER_URLS = new Set(DEMO_MEDIA_ASSETS.map((a) => a.poster))
const ASSET_BY_VIDEO = new Map(DEMO_MEDIA_ASSETS.map((a) => [a.video, a]))

/** Playable assets only — deduped by video URL */
export const PLAYABLE_DEMO_MEDIA_ASSETS: readonly DemoMediaAsset[] = DEMO_MEDIA_ASSETS

export { isBlockedMixkitId, isQualityBlockedVideoUrl } from '@/lib/demo-video-quality'

export { mixkitIdFromVideoUrl } from '@/lib/demo-video-quality'

export function isLocalDemoMediaUrl(url: string | undefined): boolean {
  return Boolean(url?.trim().startsWith('/demo-videos/'))
}

/** True when URL is in the verified playable demo pool. */
export function isPlayableDemoVideoUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false
  const trimmed = url.trim()
  if (isQualityBlockedVideoUrl(trimmed)) return false
  return PLAYABLE_VIDEO_URLS.has(trimmed)
}

export function isPlayableDemoPosterUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false
  return PLAYABLE_POSTER_URLS.has(url.trim())
}

/** Trusted pool URLs — skip network metadata probes (avoids false failures). */
export function isTrustedDemoVideoUrl(url: string | undefined): boolean {
  return isPlayableDemoVideoUrl(url)
}

export function posterForVideoUrl(videoUrl: string): string | null {
  return ASSET_BY_VIDEO.get(videoUrl.trim())?.poster ?? null
}

export function getAssetsForNiche(niche: DemoCatalogNiche): DemoMediaAsset[] {
  const localPath = LOCAL_MEDIA_BY_NICHE[niche]
  const local = localPath ? LOCAL_DEMO_MEDIA.filter((a) => a.video === localPath) : []
  const remote = NICHE_MIXKIT_IDS[niche]
    .filter((id) => !isBlockedMixkitId(id))
    .map((id) => ASSET_BY_VIDEO.get(mixkitVideoUrl(id)))
    .filter((a): a is DemoMediaAsset => Boolean(a))
  return [...local, ...remote]
}

export function getDemoMedia(index: number): DemoMediaAsset {
  return PLAYABLE_DEMO_MEDIA_ASSETS[index % PLAYABLE_DEMO_MEDIA_ASSETS.length]
}
