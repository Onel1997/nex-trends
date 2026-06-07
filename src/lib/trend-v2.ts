import { getDemoTrendCatalog } from '@/lib/demo-trend-catalog'
import { hashString } from '@/lib/demo-trend-seed'
import { enrichTrendIntelligence } from '@/lib/trend-intelligence'
import { deriveCompetitionScore } from '@/lib/trend-signals'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import type {
  OpportunityTierV2,
  TrendCategoryV2,
  TrendStatusV2,
  TrendV2Signals,
} from '@/types/trend-v2'

export type TrendCategoryFilterV2 = TrendCategoryV2 | 'all'

export type TrendWithV2 = TrendIntelligence & { v2: TrendV2Signals }

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function parseEngagement(value: string): number {
  const num = parseFloat(value.replace('%', '').replace(',', '.').trim())
  return Number.isFinite(num) ? num : 8
}

const NICHE_TO_CATEGORY: Record<string, TrendCategoryV2> = {
  Productivity: 'ai',
  Fitness: 'fitness',
  Beauty: 'beauty',
  'Side Hustle': 'ecommerce',
  Food: 'lifestyle',
  Luxury: 'lifestyle',
  Motivation: 'business',
  AI: 'ai',
  Business: 'business',
  Fashion: 'beauty',
}

export function resolveTrendCategoryV2(trend: TrendIntelligence): TrendCategoryV2 {
  const niche = trend.niche ?? ''
  if (NICHE_TO_CATEGORY[niche]) return NICHE_TO_CATEGORY[niche]

  const haystack = [niche, trend.title, trend.description, ...trend.hashtags]
    .join(' ')
    .toLowerCase()

  if (/game|gaming|esport|stream|twitch/.test(haystack)) return 'gaming'
  if (/finance|money|invest|crypto|budget/.test(haystack)) return 'finance'
  if (/shop|ecom|product|amazon|etsy|dropship/.test(haystack)) return 'ecommerce'
  if (/ai|automation|chatgpt|prompt/.test(haystack)) return 'ai'
  if (/fitness|gym|workout/.test(haystack)) return 'fitness'
  if (/beauty|skin|makeup|fashion/.test(haystack)) return 'beauty'
  if (/business|startup|founder|saas/.test(haystack)) return 'business'

  const seed = hashString(trend.id) % 8
  const fallback: TrendCategoryV2[] = [
    'lifestyle',
    'business',
    'ai',
    'fitness',
    'beauty',
    'ecommerce',
    'finance',
    'gaming',
  ]
  return fallback[seed] ?? 'lifestyle'
}

export function deriveGrowthPercent(trend: TrendIntelligence): number {
  const seed = hashString(`${trend.id}:growth`) % 100
  const velocityBoost: Record<string, [number, number]> = {
    rising: [12, 48],
    peak: [8, 28],
    stable: [-3, 6],
    cooling: [-22, -4],
  }
  const [min, max] = velocityBoost[trend.trendVelocity] ?? [0, 10]
  const range = max - min
  const jitter = (seed / 99) * range
  return clamp(min + jitter, -30, 60)
}

export function deriveEngagementScore(trend: TrendIntelligence): number {
  const rate = parseEngagement(trend.engagementRate || trend.engagement)
  const seed = hashString(`${trend.id}:eng`) % 12
  return clamp(rate * 9 + seed, 25, 98)
}

export function deriveMonetizationScore(trend: TrendIntelligence): number {
  const category = resolveTrendCategoryV2(trend)
  const categoryBoost: Record<TrendCategoryV2, number> = {
    ecommerce: 18,
    finance: 16,
    business: 14,
    ai: 12,
    beauty: 10,
    fitness: 8,
    gaming: 6,
    lifestyle: 5,
  }
  const seed = hashString(`${trend.id}:mon`) % 28
  const velocityBoost =
    trend.trendVelocity === 'rising' ? 10 : trend.trendVelocity === 'peak' ? 6 : 0
  return clamp(42 + categoryBoost[category] + seed + velocityBoost, 30, 96)
}

/**
 * Opportunity Score V2:
 * 40% Growth · 25% Engagement · 20% Competition · 15% Monetization
 */
export function computeOpportunityScoreV2(
  growthPercent: number,
  engagementScore: number,
  competitionScore: number,
  monetizationScore: number,
): number {
  const growthComponent = clamp(((growthPercent + 25) / 85) * 100)
  const competitionComponent = clamp(100 - competitionScore)
  const raw =
    growthComponent * 0.4 +
    engagementScore * 0.25 +
    competitionComponent * 0.2 +
    monetizationScore * 0.15
  return clamp(raw, 0, 100)
}

export function getOpportunityTier(score: number): OpportunityTierV2 {
  if (score >= 90) return 'viral'
  if (score >= 80) return 'strong'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'dead'
}

export const OPPORTUNITY_TIER_META: Record<
  OpportunityTierV2,
  { label: string; className: string }
> = {
  dead: { label: 'Dead', className: 'text-zinc-500' },
  average: { label: 'Average', className: 'text-zinc-400' },
  good: { label: 'Good', className: 'text-emerald-400' },
  strong: { label: 'Strong', className: 'text-violet-300' },
  viral: { label: 'Viral Opportunity', className: 'text-fuchsia-300' },
}

export function deriveTrendStatusV2(
  trend: TrendIntelligence,
  growthPercent: number,
  competitionScore: number,
): TrendStatusV2 {
  if (trend.trendVelocity === 'cooling' || growthPercent < -5) return 'declining'
  if (
    (trend.trendVelocity === 'peak' || trend.trendVelocity === 'rising') &&
    trend.viralScore >= 88 &&
    growthPercent >= 18
  ) {
    return 'exploding'
  }
  if (competitionScore >= 72 || (trend.trendVelocity === 'stable' && trend.viralScore >= 78)) {
    return 'saturated'
  }
  if (
    trend.trendVelocity === 'rising' &&
    trend.viralScore >= 62 &&
    trend.viralScore < 88 &&
    growthPercent >= 8
  ) {
    return 'early'
  }
  if (trend.trendVelocity === 'rising' && growthPercent >= 5) return 'early'
  if (competitionScore >= 68) return 'saturated'
  return 'early'
}

export const TREND_STATUS_V2_META: Record<
  TrendStatusV2,
  { label: string; icon: string; className: string }
> = {
  early: {
    label: 'Early',
    icon: '🟢',
    className:
      'text-emerald-200 bg-emerald-500/12 ring-emerald-400/30 shadow-[0_0_16px_-6px_rgba(52,211,153,0.35)]',
  },
  exploding: {
    label: 'Exploding',
    icon: '🔥',
    className:
      'text-rose-200 bg-rose-500/15 ring-rose-400/35 shadow-[0_0_20px_-6px_rgba(244,63,94,0.45)]',
  },
  saturated: {
    label: 'Saturated',
    icon: '🟡',
    className: 'text-amber-200 bg-amber-500/12 ring-amber-400/28',
  },
  declining: {
    label: 'Declining',
    icon: '🔴',
    className: 'text-red-200 bg-red-500/12 ring-red-400/28',
  },
}

export function attachTrendV2Signals(trend: TrendIntelligence): TrendWithV2 {
  const growthPercent = deriveGrowthPercent(trend)
  const engagementScore = deriveEngagementScore(trend)
  const competitionScore = deriveCompetitionScore(trend)
  const monetizationScore = deriveMonetizationScore(trend)
  const opportunityScore = computeOpportunityScoreV2(
    growthPercent,
    engagementScore,
    competitionScore,
    monetizationScore,
  )
  const trendScore = clamp(trend.viralScore, 0, 100)

  const v2: TrendV2Signals = {
    status: deriveTrendStatusV2(trend, growthPercent, competitionScore),
    category: resolveTrendCategoryV2(trend),
    trendScore,
    opportunityScore,
    opportunityTier: getOpportunityTier(opportunityScore),
    growthPercent,
    engagementScore,
    competitionScore,
    monetizationScore,
  }

  return { ...trend, v2 }
}

export function enrichTrendForV2(trend: TrendIntelligence, index: number): TrendWithV2 {
  return attachTrendV2Signals(enrichTrendIntelligence(trend, index))
}

export async function fetchTrendFeedV2(): Promise<TrendWithV2[]> {
  const catalog = getDemoTrendCatalog()
  return catalog.map((trend, index) => enrichTrendForV2(trend, index))
}

export function filterTrendsV2(
  trends: TrendWithV2[],
  category: TrendCategoryFilterV2,
): TrendWithV2[] {
  if (category === 'all') return trends
  return trends.filter((t) => t.v2.category === category)
}

export function sortTrendsByOpportunity(trends: TrendWithV2[]): TrendWithV2[] {
  return [...trends].sort((a, b) => b.v2.opportunityScore - a.v2.opportunityScore)
}

/** Insight copy for Trend Detail V2 — why this trend has creator potential */
export function buildTrendPotentialReason(trend: TrendWithV2): string {
  const { v2 } = trend
  const tierMeta = OPPORTUNITY_TIER_META[v2.opportunityTier]
  const parts: string[] = []

  if (trend.whyViral?.trim()) {
    parts.push(trend.whyViral.trim())
  } else if (trend.aiInsight?.trim()) {
    parts.push(trend.aiInsight.trim())
  }

  if (v2.status === 'early') {
    parts.push(
      'Frühes Zeitfenster — der Trend wächst, bevor die Nische gesättigt ist.',
    )
  } else if (v2.status === 'exploding') {
    parts.push('Explodierender Trend mit hohem Momentum — jetzt einsteigen lohnt sich.')
  }

  if (v2.growthPercent >= 8) {
    parts.push(
      `Wachstum ${v2.growthPercent >= 0 ? '+' : ''}${v2.growthPercent.toFixed(0)}% in den letzten Signalen.`,
    )
  }

  parts.push(
    `Opportunity Score ${v2.opportunityScore} (${tierMeta.label}) — ${v2.competitionScore <= 55 ? 'moderate Konkurrenz' : 'höhere Konkurrenz, aber starke Monetarisierung'}.`,
  )

  if (trend.hookAnalysis?.whyItWorks?.trim()) {
    parts.push(trend.hookAnalysis.whyItWorks.trim())
  }

  return parts.slice(0, 3).join(' ') || trend.engagementPrediction || 'Solides Potenzial für kurzes Video-Content in dieser Nische.'
}

export function getRecommendedContentIdea(trend: TrendIntelligence): string {
  const idea = trend.contentIdeas?.find((item) => item.trim().length > 0)
  if (idea) return idea
  if (trend.creatorInspiration?.trim()) return trend.creatorInspiration.trim()
  return 'Kurzes POV- oder Tutorial-Format mit klarem Hook in den ersten 3 Sekunden.'
}

export function getExampleHook(trend: TrendIntelligence): string {
  const fromAnalysis = trend.hookAnalysis?.hookText?.trim()
  if (fromAnalysis) return fromAnalysis
  const suggestion = trend.hookSuggestions?.find((item) => item.trim().length > 0)
  if (suggestion) return suggestion
  return `„${trend.title}" — so startest du mit maximalem Scroll-Stop.`
}
