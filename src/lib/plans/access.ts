import type { DashboardRouteId } from '@/lib/routes'
import { PLAN_RANK, type PlanId, type UsageActionId } from '@/lib/plans/definitions'

export type FeatureFlag =
  | 'ai_video_studio'
  | 'api_access'
  | 'white_label'
  | 'team_workspace'
  | 'unlimited_trends'
  | 'hd_exports'
  | 'priority_queue'
  | 'voiceover_studio'
  | 'captions_studio'

const ROUTE_MIN_PLAN: Partial<Record<DashboardRouteId, PlanId>> = {
  'ai-studio': 'pro_creator',
  hook: 'creator',
  'ad-copy': 'creator',
  seo: 'creator',
  analyzer: 'creator',
  'saved-trends': 'creator',
}

const FEATURE_MIN_PLAN: Record<FeatureFlag, PlanId> = {
  ai_video_studio: 'pro_creator',
  api_access: 'agency',
  white_label: 'agency',
  team_workspace: 'studio',
  unlimited_trends: 'pro_creator',
  hd_exports: 'creator',
  priority_queue: 'pro_creator',
  voiceover_studio: 'audio',
  captions_studio: 'audio',
}

const ACTION_MIN_PLAN: Partial<Record<UsageActionId, PlanId>> = {
  hook_generation: 'creator',
  seo_title: 'creator',
  ad_copy: 'creator',
  landing_analysis: 'creator',
  ai_video: 'pro_creator',
  voiceover: 'audio',
  captions: 'audio',
}

export function hasPlanRank(plan: PlanId, minimum: PlanId): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[minimum]
}

export function canAccessRoute(plan: PlanId, routeId: DashboardRouteId): boolean {
  if (plan === 'founder') return true
  const minimum = ROUTE_MIN_PLAN[routeId]
  if (!minimum) return true
  return hasPlanRank(plan, minimum)
}

export function canAccessFeature(plan: PlanId, feature: FeatureFlag): boolean {
  if (plan === 'founder') return true
  return hasPlanRank(plan, FEATURE_MIN_PLAN[feature])
}

/** Unified gate for feature flags and usage actions — prefer over legacy is_pro checks. */
export function hasFeatureAccess(plan: PlanId, gate: FeatureFlag | UsageActionId): boolean {
  if (plan === 'founder') return true
  if (gate in FEATURE_MIN_PLAN) {
    return hasPlanRank(plan, FEATURE_MIN_PLAN[gate as FeatureFlag])
  }
  const min = ACTION_MIN_PLAN[gate as UsageActionId]
  if (min) return hasPlanRank(plan, min)
  return true
}

export function getRouteUpgradePlan(routeId: DashboardRouteId): PlanId {
  return ROUTE_MIN_PLAN[routeId] ?? 'creator'
}
