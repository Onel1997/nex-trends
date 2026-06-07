/** Keep in sync with supabase/functions/_shared/plans.ts */

export const PLANS = {
  FREE: 'free',
  CREATOR: 'creator',
  PRO_CREATOR: 'pro_creator',
  STUDIO: 'studio',
  AGENCY: 'agency',
  AUDIO: 'audio',
} as const

export type PlanId =
  | 'free'
  | 'creator'
  | 'audio'
  | 'pro_creator'
  | 'studio'
  | 'agency'
  | 'founder'

export type BillingPeriod = 'monthly' | 'yearly'

export type UsageActionId =
  | 'trend_search'
  | 'hook_generation'
  | 'seo_title'
  | 'ad_copy'
  | 'landing_analysis'
  | 'ai_video'
  | 'voiceover'
  | 'captions'
  | 'ai_code'

/** Per-feature credit cost — keep in sync with DB + edge _shared/plans.ts */
export const CREDIT_COSTS: Record<UsageActionId, number> = {
  trend_search: 1,
  hook_generation: 2,
  seo_title: 2,
  ad_copy: 3,
  landing_analysis: 5,
  ai_video: 20,
  voiceover: 10,
  captions: 5,
  ai_code: 1,
}

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  creator: 1,
  audio: 2,
  pro_creator: 3,
  studio: 4,
  agency: 5,
  founder: 6,
}

/** Only agency + founder bypass balance checks */
export const UNLIMITED_CREDIT_PLANS: PlanId[] = ['agency', 'founder']

export const PAID_PLANS: PlanId[] = ['creator', 'audio', 'pro_creator', 'studio', 'agency']

export const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Free',
  creator: 'Creator',
  audio: 'Audio',
  pro_creator: 'Pro Creator',
  studio: 'Studio',
  agency: 'Agency',
  founder: 'Founder',
}

export const PLAN_MONTHLY_CREDITS: Record<PlanId, number | null> = {
  free: 25,
  creator: 250,
  audio: 500,
  pro_creator: 1000,
  studio: 5000,
  agency: null,
  founder: null,
}

export function normalizePlanId(value: string | null | undefined): PlanId {
  if (!value) return 'free'
  const v = value.trim().toLowerCase().replace(/-/g, '_')
  if (v === 'admin') return 'founder'
  if (
    v === 'free' ||
    v === 'creator' ||
    v === 'audio' ||
    v === 'pro_creator' ||
    v === 'studio' ||
    v === 'agency' ||
    v === 'founder'
  ) {
    return v as PlanId
  }
  if (v === 'pro') return 'pro_creator'
  return 'free'
}

export function pricingTierToPlanId(tier: string): PlanId {
  if (tier === 'pro-creator') return 'pro_creator'
  if (tier === 'admin') return 'founder'
  return normalizePlanId(tier)
}

export function isUnlimitedPlan(plan: PlanId): boolean {
  return UNLIMITED_CREDIT_PLANS.includes(plan)
}

export function planMonthlyCredits(plan: PlanId): number | null {
  return PLAN_MONTHLY_CREDITS[plan]
}

export function legacyIsPro(plan: PlanId, subscriptionStatus: string | null): boolean {
  if (plan === 'founder') return true
  if (!PAID_PLANS.includes(plan)) return false
  return subscriptionStatus === 'active'
}
