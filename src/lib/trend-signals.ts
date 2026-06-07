import { hashString } from '@/lib/demo-trend-seed'
import type { TrendIntelligence, TrendState } from '@/types/trend-intelligence'

const AI_INSIGHTS = [
  'High short-form engagement growth',
  'Low creator competition',
  'Strong emotional engagement trend',
  'Emerging creator opportunity',
  'Algorithm-friendly hook structure',
  'Rising save & share velocity',
  'Underserved niche window',
  'Peak posting window detected',
] as const

const CTA_ANGLES = [
  'Soft follow CTA in first 3 seconds',
  'Comment bait: „Which one are you?"',
  'Save-for-later value hook',
  'Link-in-bio teaser without hard sell',
  'Duet/Stitch invitation',
  'Limited-time offer framing',
] as const

const MONETIZATION_TEMPLATES = [
  'Affiliate product roundups · mid-funnel',
  'Digital product / template upsell',
  'Brand partnership · UGC-style integration',
  'Lead magnet → email list growth',
  'Coaching / service discovery calls',
  'SaaS free-trial conversion angle',
] as const

export const TREND_STATE_META: Record<
  TrendState,
  { label: string; className: string; icon: string }
> = {
  exploding: {
    label: 'Exploding',
    className: 'text-rose-200 bg-rose-500/15 ring-rose-400/30 shadow-[0_0_20px_-6px_rgba(244,63,94,0.45)]',
    icon: '🔥',
  },
  rising: {
    label: 'Rising',
    className: 'text-emerald-200 bg-emerald-500/12 ring-emerald-400/25',
    icon: '↑',
  },
  stable: {
    label: 'Stable',
    className: 'text-zinc-200 bg-zinc-500/12 ring-zinc-400/20',
    icon: '→',
  },
  saturated: {
    label: 'Saturated',
    className: 'text-amber-200 bg-amber-500/12 ring-amber-400/25',
    icon: '◆',
  },
}

function parseEngagement(value: string): number {
  const num = parseFloat(value.replace('%', '').replace(',', '.').trim())
  return Number.isFinite(num) ? num : 8
}

export function deriveTrendState(trend: TrendIntelligence): TrendState {
  const score = trend.viralScore
  const velocity = trend.trendVelocity

  if (velocity === 'cooling' || (velocity === 'stable' && score < 55)) {
    return 'saturated'
  }
  if (
    (velocity === 'peak' && score >= 88) ||
    (velocity === 'rising' && score >= 92)
  ) {
    return 'exploding'
  }
  if (velocity === 'rising' || (velocity === 'peak' && score >= 72)) {
    return 'rising'
  }
  return 'stable'
}

export function deriveMomentumScore(trend: TrendIntelligence): number {
  const eng = parseEngagement(trend.engagementRate || trend.engagement)
  const velocityBoost: Record<string, number> = {
    rising: 18,
    peak: 14,
    stable: 4,
    cooling: -8,
  }
  const raw =
    trend.viralScore * 0.55 +
    eng * 4.5 +
    (velocityBoost[trend.trendVelocity] ?? 0)
  return Math.min(99, Math.max(28, Math.round(raw)))
}

export function deriveCompetitionScore(trend: TrendIntelligence): number {
  const seed = hashString(`${trend.niche ?? 'general'}:${trend.platform}:${trend.id}`)
  const nicheFactor = trend.niche?.toLowerCase().includes('beauty') ? 12 : 0
  const velocityPenalty =
    trend.trendVelocity === 'peak' ? 14 : trend.trendVelocity === 'rising' ? 6 : -4
  const raw = 38 + (seed % 35) + nicheFactor + velocityPenalty
  return Math.min(95, Math.max(18, Math.round(raw)))
}

export function deriveOpportunityScore(
  momentum: number,
  competition: number,
): number {
  const raw = momentum * 0.65 + (100 - competition) * 0.35
  return Math.min(99, Math.max(22, Math.round(raw)))
}

export function deriveAiInsight(trend: TrendIntelligence): string {
  const idx = hashString(trend.id + (trend.niche ?? '')) % AI_INSIGHTS.length
  const competition = deriveCompetitionScore(trend)
  if (competition < 40) return 'Low creator competition'
  if (trend.trendVelocity === 'rising') return 'High short-form engagement growth'
  if (trend.viralScore >= 85) return 'Strong emotional engagement trend'
  return AI_INSIGHTS[idx] ?? AI_INSIGHTS[0]
}

export function deriveRisingKeywords(trend: TrendIntelligence): string[] {
  const fromTags = trend.hashtags
    .map((t) => t.replace(/^#/, '').trim())
    .filter(Boolean)
    .slice(0, 3)
  const titleWords = trend.title
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 2)
  return [...new Set([...fromTags, ...titleWords])].slice(0, 5)
}

export function deriveCtaAngles(trend: TrendIntelligence): string[] {
  const start = hashString(trend.id) % CTA_ANGLES.length
  return [
    CTA_ANGLES[start],
    CTA_ANGLES[(start + 2) % CTA_ANGLES.length],
    CTA_ANGLES[(start + 4) % CTA_ANGLES.length],
  ]
}

export function deriveMonetizationPotential(trend: TrendIntelligence): string {
  const idx = hashString(trend.niche ?? trend.title) % MONETIZATION_TEMPLATES.length
  const opportunity = deriveOpportunityScore(
    deriveMomentumScore(trend),
    deriveCompetitionScore(trend),
  )
  const tier =
    opportunity >= 80 ? 'High' : opportunity >= 60 ? 'Medium' : 'Emerging'
  return `${tier} · ${MONETIZATION_TEMPLATES[idx]}`
}

/** Attach all derived intelligence signals to a trend. */
export function attachTrendSignals(trend: TrendIntelligence): TrendIntelligence {
  const momentumScore = trend.momentumScore ?? deriveMomentumScore(trend)
  const competitionScore = trend.competitionScore ?? deriveCompetitionScore(trend)
  const opportunityScore =
    trend.opportunityScore ?? deriveOpportunityScore(momentumScore, competitionScore)

  return {
    ...trend,
    trendState: trend.trendState ?? deriveTrendState(trend),
    momentumScore,
    competitionScore,
    opportunityScore,
    aiInsight: trend.aiInsight ?? deriveAiInsight(trend),
    risingKeywords: trend.risingKeywords ?? deriveRisingKeywords(trend),
    ctaAngles: trend.ctaAngles ?? deriveCtaAngles(trend),
    monetizationPotential:
      trend.monetizationPotential ?? deriveMonetizationPotential(trend),
  }
}

export type TrendCategoryFilter =
  | 'all'
  | 'ecommerce'
  | 'ai'
  | 'local'
  | 'fitness'
  | 'finance'
  | 'beauty'
  | 'gaming'
  | 'saas'

export type TrendPlatformFilter = 'all' | 'tiktok' | 'instagram' | 'youtube'

const CATEGORY_ALIASES: Record<Exclude<TrendCategoryFilter, 'all'>, string[]> = {
  ecommerce: ['business', 'side hustle', 'fashion', 'shop', 'product'],
  ai: ['ai', 'automation', 'saas', 'tech'],
  local: ['local', 'business', 'service'],
  fitness: ['fitness', 'gym', 'workout', 'health'],
  finance: ['finance', 'money', 'invest', 'side hustle', 'business'],
  beauty: ['beauty', 'skincare', 'makeup', 'fashion'],
  gaming: ['gaming', 'game', 'esport', 'stream'],
  saas: ['saas', 'ai', 'productivity', 'software', 'tool'],
}

export function matchesCategoryFilter(
  trend: TrendIntelligence,
  category: TrendCategoryFilter,
): boolean {
  if (category === 'all') return true
  const haystack = [
    trend.niche ?? '',
    trend.title,
    trend.description,
    ...trend.hashtags,
  ]
    .join(' ')
    .toLowerCase()
  return CATEGORY_ALIASES[category].some((alias) => haystack.includes(alias))
}

export function matchesPlatformFilter(
  trend: TrendIntelligence,
  platform: TrendPlatformFilter,
): boolean {
  if (platform === 'all') return true
  const p = trend.platform.toLowerCase()
  if (platform === 'tiktok') return p.includes('tiktok')
  if (platform === 'instagram') return p.includes('instagram') || p.includes('reels')
  if (platform === 'youtube') return p.includes('youtube') || p.includes('shorts')
  return true
}

export function filterTrends(
  trends: TrendIntelligence[],
  platform: TrendPlatformFilter,
  category: TrendCategoryFilter,
): TrendIntelligence[] {
  return trends.filter(
    (t) => matchesPlatformFilter(t, platform) && matchesCategoryFilter(t, category),
  )
}
