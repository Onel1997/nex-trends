import { assignCreatorForCatalogSlot } from '@/lib/demo-creators'
import { searchDemoTrendCatalog } from '@/lib/demo-trend-search'
import { createSeededRandom, hashString } from '@/lib/demo-trend-seed'
import { getAssetsForNiche, LOCAL_DEMO_MEDIA, type DemoMediaAsset } from '@/lib/demo-media'
import { resolveMediaNiche } from '@/lib/demo-media-niches'
import { formatCreatorInspiration } from '@/lib/demo-creators'
import type { TrendIntelligence, TrendVelocity } from '@/types/trend-intelligence'

const VELOCITIES: TrendVelocity[] = ['rising', 'stable', 'peak', 'cooling']

const CAPTION_PREFIXES = [
  'POV:',
  'Real talk:',
  'Niemand spricht darüber:',
  'So geht viral:',
  'Save this:',
  'Unpopular opinion:',
  'Day in my life:',
  'Watch till the end:',
] as const

const VIEW_BUCKETS = [
  { min: 180_000, max: 890_000, suffix: 'K' },
  { min: 1.0, max: 2.8, suffix: 'M' },
  { min: 3.0, max: 8.5, suffix: 'M' },
] as const

export type DynamicTrendOptions = {
  query: string
  nonce: string
  userSeed?: string
  limit?: number
  offset?: number
}

function formatViews(value: number, suffix: 'K' | 'M'): string {
  if (suffix === 'M') return `${value.toFixed(1).replace('.0', '')}M`
  return `${Math.round(value)}K`
}

function formatEngagement(rand: () => number): string {
  const pct = 5.2 + rand() * 6.8
  return `${pct.toFixed(1).replace('.', ',')}%`
}

function estimateLikesFromViews(viewsStr: string, engagement: string): string {
  const v = viewsStr.trim().toUpperCase()
  const num = parseFloat(v)
  const mult = v.endsWith('M') ? 1_000_000 : 1_000
  const views = num * mult
  const eng = parseFloat(engagement.replace('%', '').replace(',', '.')) || 8
  const likes = Math.round(views * (eng / 100) * (0.28 + Math.random() * 0.15))
  if (likes >= 1_000_000) return `${(likes / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (likes >= 1_000) return `${Math.round(likes / 1_000)}K`
  return String(likes)
}

function pickMediaForSlot(
  trend: TrendIntelligence,
  slot: number,
  seed: number,
  usedVideos: Set<string>,
  usedThumbnails: Set<string>,
): { video: string; poster: string; duration: string } {
  const niche = resolveMediaNiche(trend.niche)
  const localFirst = [...LOCAL_DEMO_MEDIA, ...getAssetsForNiche(niche)]
  const pool: DemoMediaAsset[] = localFirst.length > 0 ? localFirst : [...LOCAL_DEMO_MEDIA]

  for (let attempt = 0; attempt < pool.length; attempt += 1) {
    const index = (slot * 17 + seed + attempt * 13) % pool.length
    const asset = pool[index]
    if (!usedVideos.has(asset.video) && !usedThumbnails.has(asset.poster)) {
      usedVideos.add(asset.video)
      usedThumbnails.add(asset.poster)
      return { video: asset.video, poster: asset.poster, duration: asset.duration }
    }
  }

  const fallback = pool[(slot + seed) % pool.length]
  return { video: fallback.video, poster: fallback.poster, duration: fallback.duration }
}

function varyHook(trend: TrendIntelligence, rand: () => number): string {
  const alts = trend.hookSuggestions ?? []
  if (alts.length > 0 && rand() > 0.35) {
    return alts[Math.floor(rand() * alts.length)]
  }
  const hook = trend.hookAnalysis.hookText
  if (rand() > 0.6) {
    const prefix = CAPTION_PREFIXES[Math.floor(rand() * CAPTION_PREFIXES.length)]
    const stripped = hook.replace(/^[„"]|["„]$/g, '').trim()
    return `„${prefix} ${stripped.slice(0, 72)}${stripped.length > 72 ? '…' : ''}"`
  }
  return hook
}

function varyCaption(trend: TrendIntelligence, rand: () => number): string {
  const ideas = trend.contentIdeas ?? []
  if (ideas.length > 0 && rand() > 0.4) {
    return ideas[Math.floor(rand() * ideas.length)]
  }
  const suffixes = [
    ' · Hohe Save-Rate in der Nische',
    ' · Perfekt für Reels & Shorts',
    ' · Trend-Sound gerade explodiert',
    ' · Kommentare fragen nach dem Setup',
  ]
  const base = trend.description.slice(0, 120)
  return base + suffixes[Math.floor(rand() * suffixes.length)]
}

function varyPlatform(current: string, rand: () => number): 'TikTok' | 'Instagram' {
  if (rand() > 0.42) return current === 'Instagram' ? 'TikTok' : 'Instagram'
  return current === 'Instagram' ? 'Instagram' : 'TikTok'
}

/**
 * Applies AI-style variation to catalog trends so each search feels fresh.
 */
export function applyDynamicTrendVariation(
  trends: TrendIntelligence[],
  nonce: string,
  offset = 0,
): TrendIntelligence[] {
  const seed = hashString(`dyn::${nonce}::${offset}`)
  const rand = createSeededRandom(seed)
  const usedVideos = new Set<string>()
  const usedThumbnails = new Set<string>()
  const usedCreators = new Set<string>()

  return trends.map((base, index) => {
    const slot = offset + index
    const platform = varyPlatform(base.platform, rand)
    const bucket = VIEW_BUCKETS[Math.floor(rand() * VIEW_BUCKETS.length)]
    const viewValue =
      bucket.suffix === 'M'
        ? bucket.min + rand() * (bucket.max - bucket.min)
        : (bucket.min + rand() * (bucket.max - bucket.min)) / 1000
    const views = formatViews(viewValue, bucket.suffix)
    const engagement = formatEngagement(rand)
    const likes = estimateLikesFromViews(views, engagement)
    const viralScore = Math.min(99, Math.max(52, base.viralScore + Math.floor(rand() * 14) - 5))
    const velocity = VELOCITIES[Math.floor(rand() * VELOCITIES.length)]
    const hookText = varyHook(base, rand)
    const description = varyCaption(base, rand)
    const media = pickMediaForSlot(base, slot, seed, usedVideos, usedThumbnails)
    const dynamicId = `${base.id}-${nonce.slice(0, 8)}-${slot}`
    const creator = assignCreatorForCatalogSlot(slot + seed, dynamicId, platform, usedCreators)

    return {
      ...base,
      id: dynamicId,
      platform,
      views,
      likes,
      engagement,
      engagementRate: engagement,
      viralScore,
      trendVelocity: velocity,
      description,
      thumbnailUrl: media.poster,
      videoUrl: media.video,
      videoDuration: media.duration,
      creator,
      creatorInspiration: formatCreatorInspiration(creator, platform),
      hookAnalysis: {
        ...base.hookAnalysis,
        hookText,
        hookScore: Math.min(99, Math.max(55, viralScore - 2 + Math.floor(rand() * 6))),
      },
      isDemo: false,
    }
  })
}

/** Full search pool for pagination — larger than a single page */
const SEARCH_POOL_MULTIPLIER = 5
const MAX_POOL_SIZE = 48

export function generateDynamicTrendResults(options: DynamicTrendOptions): TrendIntelligence[] {
  const limit = options.limit ?? 10
  const offset = options.offset ?? 0
  const poolSize = Math.min(MAX_POOL_SIZE, limit * SEARCH_POOL_MULTIPLIER)

  const raw = searchDemoTrendCatalog(options.query, {
    limit: poolSize,
    userSeed: options.userSeed,
    nonce: options.nonce,
  })

  const pageSlice = raw.slice(offset, offset + limit)
  return applyDynamicTrendVariation(pageSlice, options.nonce, offset)
}

export function hasMoreDynamicResults(
  query: string,
  offset: number,
  pageSize: number,
  nonce: string,
  userSeed?: string,
): boolean {
  const poolSize = Math.min(MAX_POOL_SIZE, Math.max(pageSize * SEARCH_POOL_MULTIPLIER, offset + pageSize + 1))
  const pool = searchDemoTrendCatalog(query, { limit: poolSize, userSeed, nonce })
  return pool.length > offset + pageSize
}
