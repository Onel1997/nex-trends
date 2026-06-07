import type { DashboardRouteId } from '@/lib/routes'
import {
  getFeatureUpgradePlan,
  hasFeatureAccess as checkFeatureAccess,
  resolveFeatureId,
  type FeatureId,
} from '@/lib/plans/feature-access'
import { type PlanId, type UsageActionId } from '@/lib/plans/definitions'

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

const ROUTE_FEATURES: Partial<Record<DashboardRouteId, FeatureId | UsageActionId>> = {
  'ai-studio': 'ai_video_studio',
  hook: 'hook_generator',
  'ad-copy': 'ad_copy_generator',
  seo: 'seo_generator',
  analyzer: 'landing_page_analyzer',
  'saved-trends': 'saved_trends',
  'trend-intelligence': 'trend_intelligence',
}

export function canAccessRoute(plan: PlanId, routeId: DashboardRouteId): boolean {
  if (plan === 'founder') return true
  const feature = ROUTE_FEATURES[routeId]
  if (!feature) return true
  return checkFeatureAccess(plan, feature)
}

export function canAccessFeature(plan: PlanId, feature: FeatureFlag): boolean {
  if (plan === 'founder') return true
  return checkFeatureAccess(plan, feature)
}

/** Unified gate for feature flags and usage actions — prefer over legacy is_pro checks. */
export function hasFeatureAccess(plan: PlanId, gate: FeatureFlag | UsageActionId | FeatureId): boolean {
  if (plan === 'founder') return true
  return checkFeatureAccess(plan, gate)
}

export function getRouteUpgradePlan(routeId: DashboardRouteId): PlanId {
  const feature = ROUTE_FEATURES[routeId]
  if (!feature) return 'creator'
  return getFeatureUpgradePlan(feature)
}

export { checkFeatureAccess as hasPlanFeature, resolveFeatureId }
