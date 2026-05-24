import { type DashboardToolId } from './constants'
import type { SubscriptionStatus, UserProfile } from '@/types/subscription'

export const PREMIUM_TOOL_IDS = [
  'ad-copy',
  'hook',
  'seo',
  'analyzer',
] as const satisfies readonly DashboardToolId[]

export type PremiumToolId = (typeof PREMIUM_TOOL_IDS)[number]

const PROFILE_CACHE_KEY = 'nextrends_profile_cache'
const PROFILE_CACHE_TTL_MS = 60_000

export function isPremiumTool(toolId: DashboardToolId): toolId is PremiumToolId {
  return (PREMIUM_TOOL_IDS as readonly string[]).includes(toolId)
}

export function hasProAccess(profile: UserProfile | null): boolean {
  if (!profile) return false
  return profile.is_pro === true && profile.subscription_status === 'active'
}

export function getDefaultProfile(): UserProfile {
  return {
    is_pro: false,
    subscription_status: 'inactive',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    monthly_usage_count: 0,
    usage_reset_date: null,
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

    return cached.profile
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
    // sessionStorage unavailable – ignore
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
