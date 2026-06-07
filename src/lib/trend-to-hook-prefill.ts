import {
  setHookRegeneratePrefill,
  type HookRegeneratePrefill,
} from '@/lib/hook-regenerate-session'
import { navigateToTool } from '@/lib/navigation'
import { trendTopicFromIntelligence } from '@/lib/trend-session-storage'
import type { TrendWithV2 } from '@/lib/trend-v2'
import type { HookPlatform, HookTone } from '@/types/ai-generation'
import { TREND_CATEGORY_V2_LABELS } from '@/types/trend-v2'

export function resolveHookPlatformFromTrend(platform: string): HookPlatform {
  const lower = platform.toLowerCase()
  if (lower.includes('tiktok')) return 'TikTok'
  if (lower.includes('instagram') || lower.includes('reels')) return 'Instagram Reels'
  if (lower.includes('youtube') || lower.includes('shorts')) return 'YouTube Shorts'
  if (lower.includes('meta') || lower.includes('ads')) return 'Meta Ads'
  return 'TikTok'
}

export function buildTrendHookPrefill(trend: TrendWithV2): HookRegeneratePrefill {
  const categoryLabel = TREND_CATEGORY_V2_LABELS[trend.v2.category]
  const platform = resolveHookPlatformFromTrend(trend.platform)
  const topic = trendTopicFromIntelligence(trend)
  const description = trend.description?.trim() || undefined

  const contextParts = [
    description,
    `Kategorie: ${categoryLabel}`,
    trend.niche?.trim() ? `Nische: ${trend.niche.trim()}` : null,
  ].filter(Boolean)

  return {
    topic,
    tone: 'aggressive' as HookTone,
    platform,
    trendTitle: trend.title,
    category: categoryLabel,
    description,
    context: contextParts.join('\n'),
  }
}

export function openHookGeneratorForTrend(trend: TrendWithV2): void {
  setHookRegeneratePrefill(buildTrendHookPrefill(trend))
  navigateToTool('hook')
}
