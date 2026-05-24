import { searchTrendIntelligence as searchOpenAITrends } from '@/lib/openai'
import { DEMO_TREND_INTELLIGENCE } from '@/lib/trend-demo-data'
import { enrichTrendWithMedia } from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendsApiOptions = {
  /** Simulated network latency in ms (demo only) */
  delayMs?: number
}

const DEFAULT_DELAY_MS = 600

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock API: returns curated demo trends with realistic latency.
 * Replace implementation with real API fetch when backend is ready.
 */
export async function fetchDemoTrends(
  options: TrendsApiOptions = {},
): Promise<TrendIntelligence[]> {
  const delay = options.delayMs ?? DEFAULT_DELAY_MS
  await simulateLatency(delay)
  return DEMO_TREND_INTELLIGENCE.map((t) => ({ ...t, isDemo: true }))
}

/**
 * Search trends by niche — uses OpenAI today, enriches with media fallbacks.
 * Future: swap body for `fetch('/api/trends?niche=...')`.
 */
export async function fetchTrendsByNiche(
  niche: string,
  options: TrendsApiOptions = {},
): Promise<TrendIntelligence[]> {
  const delay = options.delayMs ?? 0
  if (delay > 0) await simulateLatency(delay)

  const raw = await searchOpenAITrends(niche)
  return raw.map((trend, index) =>
    enrichTrendWithMedia(
      {
        ...trend,
        niche,
        isDemo: false,
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
