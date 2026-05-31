import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendDashboardSection = {
  id: string
  title: string
  subtitle: string
  items: TrendDashboardItem[]
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

export function buildTrendDashboardSnapshot(
  trends: TrendIntelligence[],
): TrendDashboardSnapshot {
  if (trends.length === 0) {
    return {
      avgOpportunity: 0,
      explodingCount: 0,
      risingCount: 0,
      topPlatform: '—',
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

  const trendingTopics = topBy(trends, (t) => t.opportunityScore ?? 0, 6).map((t) => ({
    id: t.id,
    label: t.title,
    meta: t.niche ?? t.platform,
    score: t.opportunityScore,
    platform: t.platform,
  }))

  const viralHooks = topBy(trends, (t) => t.hookAnalysis.hookScore, 5).map((t) => ({
    id: `${t.id}-hook`,
    label: t.hookAnalysis.hookText.slice(0, 72) + (t.hookAnalysis.hookText.length > 72 ? '…' : ''),
    meta: `Score ${t.hookAnalysis.hookScore}`,
    score: t.hookAnalysis.hookScore,
  }))

  const nicheMap = trends.reduce<Record<string, number>>((acc, t) => {
    const niche = t.niche ?? 'Allgemein'
    acc[niche] = (acc[niche] ?? 0) + (t.momentumScore ?? 0)
    return acc
  }, {})
  const trendingNiches = Object.entries(nicheMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([niche, score]) => ({
      id: `niche-${niche}`,
      label: niche,
      meta: 'Kategorie Momentum',
      score: Math.round(score / Math.max(1, trends.filter((t) => t.niche === niche).length)),
    }))

  const platformTrends = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([platform, count]) => ({
      id: `platform-${platform}`,
      label: platform,
      meta: `${count} Signale`,
      score: count,
    }))

  const aiSignals = topBy(trends, (t) => t.momentumScore ?? 0, 5).map((t) => ({
    id: `${t.id}-signal`,
    label: t.aiInsight ?? 'Neue Creator-Chance',
    meta: trendStateLabel(t.trendState),
    score: t.momentumScore,
  }))

  const keywordMap = new Map<string, number>()
  for (const t of trends) {
    for (const kw of t.risingKeywords ?? []) {
      const key = kw.toLowerCase()
      keywordMap.set(key, (keywordMap.get(key) ?? 0) + (t.momentumScore ?? 50))
    }
  }
  const risingKeywords = [...keywordMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, score]) => ({
      id: `kw-${label}`,
      label: label.startsWith('#') ? label : `#${label}`,
      meta: 'Im Trend',
      score: Math.round(score / trends.length),
    }))

  const opportunityScores = topBy(trends, (t) => t.opportunityScore ?? 0, 6).map((t) => ({
    id: `${t.id}-opp`,
    label: t.title.slice(0, 48) + (t.title.length > 48 ? '…' : ''),
    meta: `${t.competitionScore}% Konkurrenz`,
    score: t.opportunityScore,
  }))

  const sections: TrendDashboardSection[] = [
    {
      id: 'topics',
      title: 'Trendthemen',
      subtitle: 'Trends mit größtem Potenzial',
      items: trendingTopics,
    },
    {
      id: 'hooks',
      title: 'Virale Hooks',
      subtitle: 'Beste Hook-Opener',
      items: viralHooks,
    },
    {
      id: 'niches',
      title: 'Trend-Nischen',
      subtitle: 'Kategorie Momentum',
      items: trendingNiches,
    },
    {
      id: 'platforms',
      title: 'Plattform-Trends',
      subtitle: 'Signal-Verteilung',
      items: platformTrends,
    },
    {
      id: 'signals',
      title: 'KI-Trend-Signale',
      subtitle: 'Creator-Intelligence',
      items: aiSignals,
    },
    {
      id: 'keywords',
      title: 'Steigende Keywords',
      subtitle: 'Hashtag- & Themen-Trend',
      items: risingKeywords,
    },
    {
      id: 'opportunity',
      title: 'Chancen-Scores',
      subtitle: 'Beste Einstiegsfenster',
      items: opportunityScores,
    },
  ]

  return {
    avgOpportunity,
    explodingCount,
    risingCount,
    topPlatform,
    sections,
  }
}
