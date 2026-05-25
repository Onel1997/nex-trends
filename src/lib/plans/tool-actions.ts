import type { DashboardRouteId } from '@/lib/routes'
import { CREDIT_COSTS, type UsageActionId } from '@/lib/plans/definitions'

const TOOL_ACTION_MAP: Partial<Record<DashboardRouteId, UsageActionId>> = {
  'trend-intelligence': 'trend_search',
  hook: 'hook_generation',
  seo: 'seo_title',
  'ad-copy': 'ad_copy',
  analyzer: 'landing_analysis',
  'ai-studio': 'ai_video',
}

export function toolIdToUsageAction(toolId: DashboardRouteId | string): UsageActionId {
  const key = toolId as DashboardRouteId
  return TOOL_ACTION_MAP[key] ?? 'hook_generation'
}

/** Map client tool slug to usage_logs action id */
export function toolSlugToUsageAction(tool: string): UsageActionId {
  const normalized = tool.replace(/-/g, '_') as UsageActionId
  if (normalized in CREDIT_COSTS) {
    return normalized
  }
  const map: Record<string, UsageActionId> = {
    trend_intelligence: 'trend_search',
    hook: 'hook_generation',
    seo: 'seo_title',
    ad_copy: 'ad_copy',
    analyzer: 'landing_analysis',
    ai_studio: 'ai_video',
  }
  return map[normalized] ?? 'hook_generation'
}
