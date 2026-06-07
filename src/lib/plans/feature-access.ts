import type { PlanId } from '@/lib/plans/definitions'

/** Canonical plan identifiers — extend here when adding tiers. */
export const PLANS = {
  FREE: 'free',
  CREATOR: 'creator',
  PRO_CREATOR: 'pro_creator',
  STUDIO: 'studio',
  AGENCY: 'agency',
  AUDIO: 'audio',
} as const satisfies Record<string, PlanId>

export type FeatureId =
  | 'basic_trends'
  | 'basic_hooks'
  | 'trend_intelligence'
  | 'hook_generator'
  | 'seo_generator'
  | 'ad_copy_generator'
  | 'saved_trends'
  | 'landing_page_analyzer'
  | 'advanced_analytics'
  | 'viral_frameworks'
  | 'priority_generation'
  | 'ai_video_studio'
  | 'voiceovers'
  | 'captions'
  | 'premium_templates'
  | 'workspace_system'
  | 'brand_presets'
  | 'all_features'
  | 'white_label'
  | 'api_access'
  | 'client_workspaces'
  | 'team_roles'
  | 'commercial_scaling'
  | 'hd_exports'

/**
 * Per-plan feature bundles — config-driven, no hardcoded rank checks.
 * Agency `all_features` grants every feature flag.
 */
export const FEATURE_ACCESS: Record<PlanId, readonly FeatureId[]> = {
  free: ['basic_trends', 'basic_hooks'],
  creator: [
    'trend_intelligence',
    'hook_generator',
    'seo_generator',
    'ad_copy_generator',
    'saved_trends',
    'hd_exports',
  ],
  audio: [
    'trend_intelligence',
    'hook_generator',
    'seo_generator',
    'ad_copy_generator',
    'saved_trends',
    'hd_exports',
    'voiceovers',
    'captions',
  ],
  pro_creator: [
    'trend_intelligence',
    'hook_generator',
    'seo_generator',
    'ad_copy_generator',
    'saved_trends',
    'landing_page_analyzer',
    'advanced_analytics',
    'viral_frameworks',
    'priority_generation',
    'hd_exports',
  ],
  studio: [
    'trend_intelligence',
    'hook_generator',
    'seo_generator',
    'ad_copy_generator',
    'saved_trends',
    'landing_page_analyzer',
    'advanced_analytics',
    'viral_frameworks',
    'priority_generation',
    'ai_video_studio',
    'voiceovers',
    'captions',
    'premium_templates',
    'workspace_system',
    'brand_presets',
    'hd_exports',
  ],
  agency: [
    'all_features',
    'white_label',
    'api_access',
    'client_workspaces',
    'team_roles',
    'commercial_scaling',
  ],
  founder: ['all_features'],
}

/** Maps legacy feature flags & usage actions to canonical FeatureId keys. */
export const FEATURE_ALIASES: Record<string, FeatureId> = {
  ai_video_studio: 'ai_video_studio',
  api_access: 'api_access',
  white_label: 'white_label',
  team_workspace: 'workspace_system',
  unlimited_trends: 'trend_intelligence',
  hd_exports: 'hd_exports',
  priority_queue: 'priority_generation',
  voiceover_studio: 'voiceovers',
  captions_studio: 'captions',
  hook_generation: 'hook_generator',
  seo_title: 'seo_generator',
  ad_copy: 'ad_copy_generator',
  landing_analysis: 'landing_page_analyzer',
  ai_video: 'ai_video_studio',
  voiceover: 'voiceovers',
  captions: 'captions',
  trend_search: 'basic_trends',
}

export function resolveFeatureId(feature: string): FeatureId | null {
  const key = feature.trim().toLowerCase().replace(/-/g, '_')
  if (key in FEATURE_ALIASES) return FEATURE_ALIASES[key]
  const plans = Object.values(FEATURE_ACCESS).flat()
  if ((plans as string[]).includes(key)) return key as FeatureId
  return null
}

export function hasFeatureAccess(plan: string, feature: string): boolean {
  const normalizedPlan = (plan?.trim().toLowerCase().replace(/-/g, '_') ?? 'free') as PlanId
  if (normalizedPlan === 'founder') return true

  const featureId = resolveFeatureId(feature)
  if (!featureId) return false

  const grants = FEATURE_ACCESS[normalizedPlan]
  if (!grants) return false
  if (grants.includes('all_features')) return true
  return grants.includes(featureId)
}

/** Minimum plan that unlocks a feature — for upgrade CTAs. */
export function getFeatureUpgradePlan(feature: string): PlanId {
  const featureId = resolveFeatureId(feature)
  if (!featureId) return 'creator'

  const order: PlanId[] = [
    'free',
    'creator',
    'audio',
    'pro_creator',
    'studio',
    'agency',
    'founder',
  ]

  for (const plan of order) {
    if (hasFeatureAccess(plan, featureId)) return plan
  }
  return 'pro_creator'
}
