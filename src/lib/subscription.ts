import { isAdminEmail } from '@/lib/admin'
import {
  isUnlimitedPlan,
  legacyIsPro,
  normalizePlanId,
  type PlanId,
} from '@/lib/plans'
import { SIGNUP_CREDITS } from './constants'
import type { DashboardRouteId } from './routes'
import type { SubscriptionStatus, UserProfile } from '@/types/subscription'

export const PREMIUM_TOOL_IDS = [
  'hook',
  'seo',
  'ad-copy',
  'analyzer',
] as const satisfies readonly DashboardRouteId[]

export type PremiumToolId = (typeof PREMIUM_TOOL_IDS)[number]

const PROFILE_CACHE_KEY = 'nextrends_profile_cache'
const PROFILE_CACHE_TTL_MS = 60_000

export function isPremiumTool(toolId: DashboardRouteId): toolId is PremiumToolId {
  return (PREMIUM_TOOL_IDS as readonly string[]).includes(toolId)
}

export function resolveUserPlan(
  profile: UserProfile | null,
  email?: string | null,
): PlanId {
  if (isAdminEmail(email)) return 'founder'
  return normalizePlanId(profile?.plan)
}

export function hasProAccess(profile: UserProfile | null): boolean {
  if (!profile) return false
  const plan = normalizePlanId(profile.plan)
  return legacyIsPro(plan, profile.subscription_status)
}

export function hasPaidSubscription(profile: UserProfile | null, email?: string | null): boolean {
  if (isAdminEmail(email)) return true
  if (!profile) return false
  const plan = resolveUserPlan(profile, email)
  return plan !== 'free' && profile.subscription_status === 'active'
}

export function hasUnlimitedCredits(profile: UserProfile | null, email?: string | null): boolean {
  if (isAdminEmail(email)) return true
  const plan = resolveUserPlan(profile, email)
  return isUnlimitedPlan(plan) && hasPaidSubscription(profile, email)
}

/** Unlimited credits — founder, admin email, or unlimited-tier active subscription */
export function hasPremiumAccess(
  profile: UserProfile | null,
  email?: string | null,
): boolean {
  if (isAdminEmail(email)) return true
  if (!profile) return false
  const plan = resolveUserPlan(profile, email)
  if (plan === 'founder') return true
  return isUnlimitedPlan(plan) && profile.subscription_status === 'active'
}

export function getDefaultProfile(): UserProfile {
  const now = new Date()
  return {
    plan: 'free',
    is_pro: false,
    subscription_status: 'inactive',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    credit_balance: SIGNUP_CREDITS,
    monthly_usage_count: 0,
    last_weekly_refill_at: now.toISOString(),
    usage_reset_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    billing_period: 'monthly',
  }
}

export function readProfileCache(userId: string): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null

    const cached = JSON.parse(raw) as {
      userId: string
      profile: UserProfile
      fetchedAt: number
    }

    if (cached.userId !== userId) return null
    if (Date.now() - cached.fetchedAt > PROFILE_CACHE_TTL_MS) return null

    return {
      ...cached.profile,
      plan: normalizePlanId(cached.profile.plan),
    }
  } catch {
    return null
  }
}

export function writeProfileCache(userId: string, profile: UserProfile): void {
  try {
    sessionStorage.setItem(
      PROFILE_CACHE_KEY,
      JSON.stringify({ userId, profile, fetchedAt: Date.now() }),
    )
  } catch {
    // ignore
  }
}

export function clearProfileCache(): void {
  try {
    sessionStorage.removeItem(PROFILE_CACHE_KEY)
  } catch {
    // ignore
  }
}

export function normalizeSubscriptionStatus(
  value: string | null | undefined,
): SubscriptionStatus {
  return value === 'active' ? 'active' : 'inactive'
}
