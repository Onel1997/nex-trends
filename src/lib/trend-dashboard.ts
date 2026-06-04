import { attachTrendSignals } from '@/lib/trend-signals'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendDashboardLayout =
  | 'leaderboard'
  | 'hook-rows'
  | 'keyword-chips'
  | 'platform-stats'
  | 'signal-rows'

export type TrendDashboardSection = {
  id: string
  title: string
  subtitle: string
  layout: TrendDashboardLayout
  items: TrendDashboardItem[]
  /** Section open by default on first paint */
  defaultExpanded?: boolean
}

export type TrendDashboardItem = {
  id: string
  label: string
  meta?: string
  score?: number
  platform?: string
}

export type TrendDashboardSnapshot = {
  avgOpportunity: number
  explodingCount: number
  risingCount: number
  topPlatform: string
  platformStats: TrendDashboardItem[]
  sections: TrendDashboardSection[]
}

function trendStateLabel(state?: string): string {
  switch (state) {
    case 'exploding':
      return 'Explodiert'
    case 'rising':
      return 'Im Trend'
    case 'stable':
      return 'Stabil'
    case 'saturated':
      return 'Gesättigt'
    default:
      return state ?? 'Im Trend'
  }
}

function topBy<T>(items: T[], scoreFn: (item: T) => number, limit: number): T[] {
  return [...items].sort((a, b) => scoreFn(b) - scoreFn(a)).slice(0, limit)
}

/** Highest opportunity trend in the current feed (presentation only). */
export function pickBestOpportunityTrend(
  trends: TrendIntelligence[],
): TrendIntelligence | null {
  if (trends.length === 0) return null

  let best: TrendIntelligence | null = null
  let bestScore = -1

  for (const raw of trends) {
    const trend = attachTrendSignals(raw)
    const score = trend.opportunityScore ?? 0
    if (score > bestScore) {
      bestScore = score
      best = trend
    }
  }

  return best
}

const SECTION_ITEM_CAP = 12

export function buildTrendDashboardSnapshot(
  trends: TrendIntelligence[],
): TrendDashboardSnapshot {
  if (trends.length === 0) {
    return {
      avgOpportunity: 0,
      explodingCount: 0,
      risingCount: 0,
      topPlatform: '—',
      platformStats: [],
      sections: [],
    }
  }

  const avgOpportunity = Math.round(
    trends.reduce((sum, t) => sum + (t.opportunityScore ?? 0), 0) / trends.length,
  )
  const explodingCount = trends.filter((t) => t.trendState === 'exploding').length
  const risingCount = trends.filter((t) => t.trendState === 'rising').length

  const platformCounts = trends.reduce<Record<string, number>>((acc, t) => {
    const key = t.platform.split(' ')[0] ?? t.platform
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const topPlatform =
    Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'TikTok'

  const platformStats = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => ({
      id: `platform-${platform}`,
      label: platform,
      meta: 'Signale',
      score: count,
    }))

  const topOpportunities = topBy(trends, (t) => t.opportunityScore ?? 0, SECTION_ITEM_CAP).map(
    (t) => ({
      id: t.id,
      label: t.title,
      meta: t.niche ?? t.platform,
      score: t.opportunityScore,
      platform: t.platform,
    }),
  )

  const viralHooks = topBy(trends, (t) => t.hookAnalysis.hookScore, SECTION_ITEM_CAP).map((t) => ({
    id: `${t.id}-hook`,
    label: t.hookAnalysis.hookText,
    meta: t.platform,
    score: t.hookAnalysis.hookScore,
  }))

  const keywordMap = new Map<string, number>()
  for (const t of trends) {
    for (const kw of t.risingKeywords ?? []) {
      const key = kw.toLowerCase().replace(/^#/, '')
      keywordMap.set(key, (keywordMap.get(key) ?? 0) + (t.momentumScore ?? 50))
    }
  }
  const risingKeywords = [...keywordMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, SECTION_ITEM_CAP)
    .map(([label, score]) => ({
      id: `kw-${label}`,
      label: label.startsWith('#') ? label : `#${label}`,
      meta: 'Im Trend',
      score: Math.min(99, Math.round(score / Math.max(1, trends.length))),
    }))

  const aiSignals = topBy(trends, (t) => t.momentumScore ?? 0, SECTION_ITEM_CAP).map((t) => ({
    id: `${t.id}-signal`,
    label: t.aiInsight ?? t.title,
    meta: trendStateLabel(t.trendState),
    score: t.momentumScore,
  }))

  const sections: TrendDashboardSection[] = [
    {
      id: 'topics',
      title: 'Top Chancen',
      subtitle: 'Trendthemen mit höchstem Potenzial',
      layout: 'leaderboard',
      defaultExpanded: true,
      items: topOpportunities,
    },
    {
      id: 'hooks',
      title: 'Top Hooks',
      subtitle: 'Virale Hook-Opener nach Score',
      layout: 'hook-rows',
      defaultExpanded: true,
      items: viralHooks,
    },
    {
      id: 'keywords',
      title: 'Top Keywords',
      subtitle: 'Hashtags & Suchbegriffe im Trend',
      layout: 'keyword-chips',
      defaultExpanded: true,
      items: risingKeywords,
    },
    {
      id: 'signals',
      title: 'Signals',
      subtitle: 'KI-Trend-Signale für Creator',
      layout: 'signal-rows',
      defaultExpanded: false,
      items: aiSignals,
    },
  ]

  return {
    avgOpportunity,
    explodingCount,
    risingCount,
    topPlatform,
    platformStats,
    sections,
  }
}

/** Strip synthetic suffixes from dashboard item ids before opening a trend */
export function trendIdFromDashboardItem(itemId: string): string {
  if (itemId.startsWith('kw-') || itemId.startsWith('platform-') || itemId.startsWith('niche-')) {
    return ''
  }
  return itemId.replace(/-(hook|signal|opp)$/, '')
}

export function resolveDashboardTrendId(
  item: TrendDashboardItem,
  trends: TrendIntelligence[],
): string {
  const direct = trendIdFromDashboardItem(item.id)
  if (direct) return direct

  if (item.id.startsWith('kw-')) {
    const tag = item.label.replace(/^#/, '').toLowerCase()
    const match = trends.find((t) =>
      t.risingKeywords?.some((k) => k.toLowerCase().replace(/^#/, '') === tag),
    )
    return match?.id ?? ''
  }

  return ''
}
