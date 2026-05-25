import { getDemoTrendCatalog, type DemoCatalogNiche, DEMO_CATALOG_NICHES } from '@/lib/demo-trend-catalog'
import { createSeededRandom, searchShuffleSeed } from '@/lib/demo-trend-seed'
import {
  assertUniqueTrendSet,
  countUniqueCreators,
  countUniqueVideos,
  pickUniqueTrends,
} from '@/lib/demo-trend-uniqueness'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const DEFAULT_LIMIT = 10
const MIN_POOL_TARGET = 32
const MIN_UNIQUE_VIDEOS = 4
const MIN_UNIQUE_CREATORS = 4

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

/** Related niches mixed in when primary category has too few unique assets */
const RELATED_NICHES: Record<DemoCatalogNiche, DemoCatalogNiche[]> = {
  Productivity: ['Motivation', 'Business', 'AI'],
  Fitness: ['Motivation', 'Food', 'Productivity'],
  Beauty: ['Fashion', 'Luxury'],
  'Side Hustle': ['Business', 'AI', 'Motivation'],
  Food: ['Fitness', 'Luxury', 'Fashion'],
  Luxury: ['Fashion', 'Beauty'],
  Motivation: ['Fitness', 'Productivity', 'Business'],
  AI: ['Business', 'Side Hustle', 'Productivity'],
  Business: ['Side Hustle', 'Motivation', 'AI'],
  Fashion: ['Beauty', 'Luxury', 'Fitness'],
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

function slugifyNiche(niche: string): string {
  return niche.toLowerCase().replace(/\s+/g, '-')
}

function matchesNiche(trend: TrendIntelligence, niche: DemoCatalogNiche): boolean {
  return trend.niche?.toLowerCase() === niche.toLowerCase()
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
    if (aliases.some((a) => q.includes(a) || a.includes(q))) {
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
  const q = normalizeQuery(query)
  if (!q) return []

  const exact = DEMO_CATALOG_NICHES.filter((niche) => {
    const label = niche.toLowerCase()
    const slug = slugifyNiche(niche)
    return q === label || q === slug || q.includes(label) || label.includes(q)
  })
  if (exact.length > 0) return exact

  return (Object.entries(NICHE_ALIASES) as [DemoCatalogNiche, string[]][])
    .filter(([, aliases]) => aliases.some((a) => q.includes(a) || a.includes(q)))
    .map(([niche]) => niche)
}

function appendUniqueById(target: TrendIntelligence[], source: TrendIntelligence[]): void {
  const ids = new Set(target.map((t) => t.id))
  for (const trend of source) {
    if (ids.has(trend.id)) continue
    ids.add(trend.id)
    target.push(trend)
  }
}

/** Primary niche trends + related categories + scored extras until pool is large enough */
function buildCategorySearchPool(
  catalog: TrendIntelligence[],
  primaryNiches: DemoCatalogNiche[],
  query: string,
): TrendIntelligence[] {
  const pool: TrendIntelligence[] = []

  const primary = catalog.filter((t) => primaryNiches.some((n) => matchesNiche(t, n)))
  appendUniqueById(pool, primary)

  const relatedSet = new Set<DemoCatalogNiche>()
  for (const niche of primaryNiches) {
    for (const related of RELATED_NICHES[niche]) {
      relatedSet.add(related)
    }
  }

  for (const related of relatedSet) {
    if (pool.length >= MIN_POOL_TARGET) break
    const relatedTrends = catalog.filter((t) => matchesNiche(t, related))
    appendUniqueById(pool, relatedTrends)
  }

  if (pool.length < MIN_POOL_TARGET) {
    const scored = catalog
      .map((trend) => ({ trend, score: scoreTrendForQuery(trend, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.trend)
    appendUniqueById(pool, scored)
  }

  if (pool.length < MIN_POOL_TARGET) {
    appendUniqueById(
      pool,
      catalog.filter((t) => !pool.some((p) => p.id === t.id)),
    )
  }

  return pool
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
  catalog: TrendIntelligence[],
  limit: number,
  seed: number,
): TrendIntelligence[] {
  let picked = pickUniqueTrends(shuffledPool, limit)

  if (
    picked.length < limit ||
    countUniqueVideos(picked) < MIN_UNIQUE_VIDEOS ||
    countUniqueCreators(picked) < MIN_UNIQUE_CREATORS
  ) {
    const supplement = shuffleSeeded(catalog, seed + 17)
    picked = pickUniqueTrends([...picked, ...supplement], limit)
  }

  return reorderNoAdjacentDuplicates(picked).map((t) => ({ ...t, isDemo: true }))
}

export function searchDemoTrendCatalog(
  query: string,
  options: { limit?: number; userSeed?: string } = {},
): TrendIntelligence[] {
  const limit = options.limit ?? DEFAULT_LIMIT
  const catalog = getDemoTrendCatalog()
  const seed = searchShuffleSeed(query, options.userSeed)
  const q = normalizeQuery(query)
  const primaryNiches = resolvePrimaryNiches(q)

  let pool: TrendIntelligence[]

  if (primaryNiches.length > 0) {
    pool = buildCategorySearchPool(catalog, primaryNiches, q)
  } else {
    const scored = catalog
      .map((trend) => ({ trend, score: scoreTrendForQuery(trend, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.trend)

    pool = scored.length > 0 ? scored : [...catalog]
    if (pool.length < MIN_POOL_TARGET) {
      appendUniqueById(pool, catalog)
    }
  }

  const shuffled = shuffleSeeded(pool, seed)
  const results = finalizeSearchResults(shuffled, catalog, limit, seed)

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

  appendUniqueById(pool, shuffleSeeded(catalog, seed + 99))

  const shuffled = shuffleSeeded(pool, seed + 3)
  const results = finalizeSearchResults(shuffled, catalog, limit, seed)

  assertUniqueTrendSet(results, 'browse pack')
  return results
}

function hashNiche(niche: string): number {
  let h = 0
  for (let i = 0; i < niche.length; i++) h = (h * 31 + niche.charCodeAt(i)) | 0
  return Math.abs(h)
}
