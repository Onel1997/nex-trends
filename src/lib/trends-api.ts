import { getDemoUserSeed, searchShuffleSeed } from '@/lib/demo-trend-seed'
import { pickDemoBrowsePack, searchDemoTrendCatalog } from '@/lib/demo-trend-search'
import { ensureFeedMediaDiversity } from '@/lib/trend-media-assignment'
import { enrichTrendIntelligence } from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendsApiOptions = {
  /** Simulated network latency in ms (demo only) */
  delayMs?: number
  /** Stable per-browser seed for deterministic shuffle order */
  userSeed?: string
  /** Max trends returned */
  limit?: number
}

const DEFAULT_DELAY_MS = 600
const DEFAULT_SEARCH_LIMIT = 10
const DEFAULT_DEMO_LIMIT = 8

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock API: seeded browse pack across niches — order stable across reloads.
 */
export async function fetchDemoTrends(
  options: TrendsApiOptions = {},
): Promise<TrendIntelligence[]> {
  const delay = options.delayMs ?? DEFAULT_DELAY_MS
  const userSeed = options.userSeed ?? getDemoUserSeed()
  const limit = options.limit ?? DEFAULT_DEMO_LIMIT

  await simulateLatency(delay)

  const seed = searchShuffleSeed('__browse__', userSeed)
  const raw = ensureFeedMediaDiversity(pickDemoBrowsePack(userSeed, limit), seed)
  return raw.map((t, i) => enrichTrendIntelligence({ ...t, isDemo: true }, i))
}

/**
 * Search demo catalog by niche/query — seeded shuffle, no adjacent duplicates.
 */
export async function fetchTrendsByNiche(
  niche: string,
  options: TrendsApiOptions = {},
): Promise<TrendIntelligence[]> {
  const delay = options.delayMs ?? 0
  const userSeed = options.userSeed ?? getDemoUserSeed()
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT

  if (delay > 0) await simulateLatency(delay)

  const raw = searchDemoTrendCatalog(niche, { limit, userSeed })
  return raw.map((trend, index) =>
    enrichTrendIntelligence(
      {
        ...trend,
        niche: trend.niche ?? niche,
        isDemo: true,
      },
      index,
    ),
  )
}

export type TrendsApi = {
  fetchDemoTrends: typeof fetchDemoTrends
  fetchTrendsByNiche: typeof fetchTrendsByNiche
}

/** Central API surface — swap implementations without touching UI */
export const trendsApi: TrendsApi = {
  fetchDemoTrends,
  fetchTrendsByNiche,
}
