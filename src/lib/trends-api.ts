import { createSearchNonce, getDemoUserSeed } from '@/lib/demo-trend-seed'
import {
  filterTrendsByNiche,
  pickDemoBrowsePack,
} from '@/lib/demo-trend-search'
import {
  generateDynamicTrendResults,
  hasMoreDynamicResults,
} from '@/lib/dynamic-trend-generator'
import { resolveCatalogNiche } from '@/lib/demo-media-niches'
import { searchShuffleSeed } from '@/lib/demo-trend-seed'
import { ensureFeedMediaDiversity, sanitizeTrendMedia } from '@/lib/trend-media-assignment'
import { enrichTrendIntelligence } from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendsApiOptions = {
  /** Simulated AI analysis latency in ms */
  delayMs?: number
  /** Stable per-browser seed */
  userSeed?: string
  /** Per-search nonce — new results every search when set */
  nonce?: string
  /** Max trends returned */
  limit?: number
  /** Pagination offset */
  offset?: number
}

export type TrendsPageResult = {
  trends: TrendIntelligence[]
  hasMore: boolean
  nonce: string
}

const DEFAULT_AI_DELAY_MS = 1400
const DEFAULT_SEARCH_LIMIT = 8
const DEFAULT_LOAD_MORE_LIMIT = 6
const DEFAULT_DEMO_LIMIT = 8

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function enrichBatch(
  raw: TrendIntelligence[],
  niche: string,
  resolvedCategory: string | null,
): TrendIntelligence[] {
  return raw.map((trend, index) =>
    enrichTrendIntelligence(
      sanitizeTrendMedia(
        {
          ...trend,
          niche: trend.niche ?? resolvedCategory ?? niche,
          isDemo: trend.isDemo ?? false,
        },
        index,
      ),
      index,
    ),
  )
}

/**
 * Browse pack — illustrative demo on first visit.
 */
export async function fetchDemoTrends(
  options: TrendsApiOptions = {},
): Promise<TrendIntelligence[]> {
  const delay = options.delayMs ?? 600
  const userSeed = options.userSeed ?? getDemoUserSeed()
  const limit = options.limit ?? DEFAULT_DEMO_LIMIT

  await simulateLatency(delay)

  const seed = searchShuffleSeed('__browse__', userSeed)
  const raw = ensureFeedMediaDiversity(pickDemoBrowsePack(userSeed, limit), seed)
  return raw.map((t, i) =>
    enrichTrendIntelligence(sanitizeTrendMedia({ ...t, isDemo: true }, i), i),
  )
}

/**
 * AI-style trend search — fresh randomized cards per nonce.
 */
export async function fetchTrendsByNiche(
  niche: string,
  options: TrendsApiOptions = {},
): Promise<TrendIntelligence[]> {
  const page = await fetchTrendsPage(niche, {
    ...options,
    limit: options.limit ?? DEFAULT_SEARCH_LIMIT,
    offset: options.offset ?? 0,
  })
  return page.trends
}

/**
 * Paginated trend search with hasMore for infinite scroll.
 */
export async function fetchTrendsPage(
  niche: string,
  options: TrendsApiOptions = {},
): Promise<TrendsPageResult> {
  const delay = options.delayMs ?? (options.offset ? 700 : DEFAULT_AI_DELAY_MS)
  const userSeed = options.userSeed ?? getDemoUserSeed()
  const nonce = options.nonce ?? createSearchNonce()
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT
  const offset = options.offset ?? 0

  if (delay > 0) await simulateLatency(delay)

  let raw = generateDynamicTrendResults({
    query: niche,
    nonce,
    userSeed,
    limit,
    offset,
  })

  const category = resolveCatalogNiche(niche)
  if (category) {
    raw = filterTrendsByNiche(raw, category)
  }

  const resolvedCategory = category ?? resolveCatalogNiche(niche)
  const seed = searchShuffleSeed(niche, userSeed, nonce)
  const diversified = ensureFeedMediaDiversity(raw, seed + offset)
  const trends = enrichBatch(diversified, niche, resolvedCategory)

  const hasMore = hasMoreDynamicResults(niche, offset, limit, nonce, userSeed)

  return { trends, hasMore, nonce }
}

export const LOAD_MORE_PAGE_SIZE = DEFAULT_LOAD_MORE_LIMIT

export type TrendsApi = {
  fetchDemoTrends: typeof fetchDemoTrends
  fetchTrendsByNiche: typeof fetchTrendsByNiche
  fetchTrendsPage: typeof fetchTrendsPage
}

/** Central API surface — swap implementations without touching UI */
export const trendsApi: TrendsApi = {
  fetchDemoTrends,
  fetchTrendsByNiche,
  fetchTrendsPage,
}
