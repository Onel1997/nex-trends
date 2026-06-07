import type { TrendInsight } from '@/types/dashboard'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const GRADIENT_PAIRS: Array<{ from: string; to: string }> = [
  { from: 'from-violet-600', to: 'to-fuchsia-600' },
  { from: 'from-indigo-500', to: 'to-purple-600' },
  { from: 'from-cyan-500', to: 'to-blue-600' },
  { from: 'from-rose-500', to: 'to-orange-600' },
]

function formatViews(views: string): string {
  const trimmed = views.trim()
  if (!trimmed) return '—'
  return trimmed
}

function formatChange(trend: TrendIntelligence): string {
  const indicator = trend.growthIndicator
  if (indicator === 'up') return '+18%'
  if (indicator === 'down') return '-4%'
  if (indicator === 'stable') return '+6%'
  const score = trend.viralScore ?? 0
  if (score >= 85) return '+24%'
  if (score >= 70) return '+14%'
  if (score >= 55) return '+9%'
  return '+5%'
}

/** Build trend analytics cards from the user's saved library (live data). */
export function buildTrendInsightsFromSaved(
  saved: TrendIntelligence[],
  limit = 4,
): TrendInsight[] {
  return saved.slice(0, limit).map((trend, index) => {
    const gradient = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length]!
    return {
      id: trend.id,
      title: trend.title,
      platform: trend.platform,
      views: formatViews(trend.views),
      change: formatChange(trend),
      gradientFrom: trend.gradientFrom || gradient.from,
      gradientTo: trend.gradientTo || gradient.to,
    }
  })
}
