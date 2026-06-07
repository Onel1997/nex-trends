import { getDemoTrendCatalog, type DemoCatalogNiche, DEMO_CATALOG_NICHES } from '@/lib/demo-trend-catalog'
import { createSeededRandom, searchShuffleSeed } from '@/lib/demo-trend-seed'
import { ensureFeedMediaDiversity } from '@/lib/trend-media-assignment'
import {
  assertUniqueTrendSet,
  countUniqueCreators,
  countUniqueVideos,
  pickUniqueTrends,
} from '@/lib/demo-trend-uniqueness'
import { queryMatchesNicheAlias, resolveCatalogNiche } from '@/lib/demo-media-niches'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const DEFAULT_LIMIT = 10
const MIN_UNIQUE_VIDEOS = 8
const MIN_UNIQUE_CREATORS = 6

const NICHE_ALIASES: Record<DemoCatalogNiche, string[]> = {
  Productivity: ['productivity', 'productive', 'morning', 'routine', 'notion', 'focus', 'deep work', 'study'],
  Fitness: ['fitness', 'gym', 'workout', 'training', 'muscle', 'cardio', 'run', 'health'],
  Beauty: ['beauty', 'skin', 'makeup', 'skincare', 'grwm', 'hair', 'glow'],
  'Side Hustle': ['side hustle', 'sidehustle', 'passive', 'freelance', 'ugc', 'resell', 'etsy', 'income'],
  Food: ['food', 'recipe', 'cooking', 'meal', 'kitchen', 'bake', 'restaurant', 'eat'],
  Luxury: ['luxury', 'quiet luxury', 'old money', 'aesthetic', 'premium', 'high end'],
  Motivation: ['motivation', 'mindset', 'discipline', 'inspire', 'goals', 'manifest'],
  AI: ['ai', 'chatgpt', 'automation', 'prompt', 'midjourney', 'artificial'],
  Business: ['business', 'startup', 'founder', 'saas', 'marketing', 'b2b', 'sales'],
  Fashion: ['fashion', 'style', 'outfit', 'ootd', 'wardrobe', 'thrift', 'haul'],
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

function matchesNiche(trend: TrendIntelligence, niche: DemoCatalogNiche): boolean {
  return trend.niche?.toLowerCase() === niche.toLowerCase()
}

/** Strict category filter — trend.niche must equal the selected catalog niche */
export function filterTrendsByNiche(
  trends: TrendIntelligence[],
  niche: DemoCatalogNiche,
): TrendIntelligence[] {
  return trends.filter((t) => matchesNiche(t, niche))
}

function scoreTrendForQuery(trend: TrendIntelligence, query: string): number {
  const q = normalizeQuery(query)
  if (!q) return 1

  let score = 0
  const niche = trend.niche ?? ''

  if (niche.toLowerCase() === q || q.includes(niche.toLowerCase())) score += 12
  if (trend.title.toLowerCase().includes(q)) score += 8
  if (trend.description.toLowerCase().includes(q)) score += 4
  if (trend.hashtags.some((h) => h.toLowerCase().includes(q.replace('#', '')))) score += 5
  if (trend.hookAnalysis.hookText.toLowerCase().includes(q)) score += 3

  for (const [cat, aliases] of Object.entries(NICHE_ALIASES) as [DemoCatalogNiche, string[]][]) {
    if (aliases.some((a) => queryMatchesNicheAlias(q, a))) {
      if (matchesNiche(trend, cat)) score += 15
    }
  }

  return score
}

function shuffleSeeded<T>(items: T[], seed: number): T[] {
  const rand = createSeededRandom(seed)
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function resolvePrimaryNiches(query: string): DemoCatalogNiche[] {
  const resolved = resolveCatalogNiche(query)
  if (resolved) return [resolved]

  const q = normalizeQuery(query)
  if (!q) return []

  const aliasMatches = (Object.entries(NICHE_ALIASES) as [DemoCatalogNiche, string[]][])
    .map(([niche, aliases]) => ({
      niche,
      score: aliases.filter((alias) => queryMatchesNicheAlias(q, alias)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  if (aliasMatches.length > 0) return [aliasMatches[0].niche]

  return []
}

function appendUniqueById(target: TrendIntelligence[], source: TrendIntelligence[]): void {
  const ids = new Set(target.map((t) => t.id))
  for (const trend of source) {
    if (ids.has(trend.id)) continue
    ids.add(trend.id)
    target.push(trend)
  }
}

/** Only trends whose niche matches the resolved category — no related-niche mixing */
function buildCategorySearchPool(
  catalog: TrendIntelligence[],
  primaryNiches: DemoCatalogNiche[],
): TrendIntelligence[] {
  return catalog.filter((t) => primaryNiches.some((n) => matchesNiche(t, n)))
}

function reorderNoAdjacentDuplicates(trends: TrendIntelligence[]): TrendIntelligence[] {
  if (trends.length <= 1) return trends

  const pool = [...trends]
  const result: TrendIntelligence[] = []
  let lastVideo = ''
  let lastThumb = ''
  let lastCreator = ''

  while (pool.length > 0) {
    let pickIndex = pool.findIndex(
      (t) =>
        t.videoUrl !== lastVideo &&
        t.thumbnailUrl !== lastThumb &&
        (t.creator?.handle ?? '') !== lastCreator,
    )
    if (pickIndex === -1) {
      pickIndex = pool.findIndex(
        (t) => t.videoUrl !== lastVideo && t.thumbnailUrl !== lastThumb,
      )
    }
    if (pickIndex === -1) {
      pickIndex = pool.findIndex((t) => t.videoUrl !== lastVideo)
    }
    if (pickIndex === -1) pickIndex = 0

    const [picked] = pool.splice(pickIndex, 1)
    result.push(picked)
    lastVideo = picked.videoUrl ?? ''
    lastThumb = picked.thumbnailUrl ?? ''
    lastCreator = picked.creator?.handle ?? ''
  }

  return result
}

function finalizeSearchResults(
  shuffledPool: TrendIntelligence[],
  limit: number,
  seed: number,
): TrendIntelligence[] {
  let picked = pickUniqueTrends(shuffledPool, limit)

  const minVideos = Math.min(limit, MIN_UNIQUE_VIDEOS)
  const minCreators = Math.min(limit, MIN_UNIQUE_CREATORS)

  if (
    picked.length < limit ||
    countUniqueVideos(picked) < minVideos ||
    countUniqueCreators(picked) < minCreators
  ) {
    const supplement = shuffleSeeded(shuffledPool, seed + 17)
    picked = pickUniqueTrends([...picked, ...supplement], limit)
  }

  const ordered = reorderNoAdjacentDuplicates(picked).map((t) => ({ ...t, isDemo: true }))
  return ensureFeedMediaDiversity(ordered, seed)
}

export function searchDemoTrendCatalog(
  query: string,
  options: { limit?: number; userSeed?: string; nonce?: string; offset?: number } = {},
): TrendIntelligence[] {
  const limit = options.limit ?? DEFAULT_LIMIT
  const offset = options.offset ?? 0
  const catalog = getDemoTrendCatalog()
  const seed = searchShuffleSeed(query, options.userSeed, options.nonce)
  const q = normalizeQuery(query)
  const primaryNiches = resolvePrimaryNiches(q)

  let pool: TrendIntelligence[]

  if (primaryNiches.length > 0) {
    pool = buildCategorySearchPool(catalog, primaryNiches)
  } else {
    const scored = catalog
      .map((trend) => ({ trend, score: scoreTrendForQuery(trend, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.trend)

    const dominantNiche = scored.find((t) => t.niche && resolveCatalogNiche(t.niche))?.niche
    if (dominantNiche && resolveCatalogNiche(dominantNiche)) {
      pool = filterTrendsByNiche(scored, dominantNiche as DemoCatalogNiche)
    } else {
      pool = scored
    }
  }

  const shuffled = shuffleSeeded(pool, seed)
  const fetchCount = Math.min(shuffled.length, limit + offset)
  const batch = finalizeSearchResults(shuffled, fetchCount, seed)
  const results = batch.slice(offset, offset + limit)

  assertUniqueTrendSet(results, `search:"${query}"`)
  return results
}

export function pickDemoBrowsePack(
  userSeed?: string,
  limit = 8,
): TrendIntelligence[] {
  const seed = searchShuffleSeed('__browse__', userSeed)
  const catalog = getDemoTrendCatalog()
  const perNiche = shuffleSeeded([...DEMO_CATALOG_NICHES], seed)

  const pool: TrendIntelligence[] = []
  for (const niche of perNiche) {
    const nicheTrends = catalog.filter((t) => matchesNiche(t, niche))
    appendUniqueById(pool, shuffleSeeded(nicheTrends, seed + hashNiche(niche)))
  }

  const shuffled = shuffleSeeded(pool, seed + 3)
  const results = finalizeSearchResults(shuffled, limit, seed)

  assertUniqueTrendSet(results, 'browse pack')
  return results
}

function hashNiche(niche: string): number {
  let h = 0
  for (let i = 0; i < niche.length; i++) h = (h * 31 + niche.charCodeAt(i)) | 0
  return Math.abs(h)
}
