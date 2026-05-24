import { invokeEdgeFunction } from './edgeFunctions'
import { FREE_MONTHLY_AI_LIMIT } from './constants'
import { hasProAccess } from './subscription'
import { supabase } from './supabase'
import type { UserProfile } from '@/types/subscription'
import type { UsageAction, UsageLimitResult } from '@/types/usage'

export { FREE_MONTHLY_AI_LIMIT }

export function getUsageFromProfile(profile: UserProfile | null): UsageLimitResult {
  if (!profile) {
    return {
      allowed: false,
      unlimited: false,
      used: 0,
      remaining: 0,
      limit: FREE_MONTHLY_AI_LIMIT,
      usageResetDate: null,
    }
  }

  const used = profile.monthly_usage_count ?? 0
  const usageResetDate = profile.usage_reset_date ?? null

  if (hasProAccess(profile)) {
    return {
      allowed: true,
      unlimited: true,
      used,
      remaining: null,
      limit: null,
      usageResetDate,
    }
  }

  const remaining = Math.max(0, FREE_MONTHLY_AI_LIMIT - used)

  return {
    allowed: remaining > 0,
    unlimited: false,
    used,
    remaining,
    limit: FREE_MONTHLY_AI_LIMIT,
    usageResetDate,
  }
}

async function invokeUsageLimit(action: UsageAction): Promise<UsageLimitResult> {
  return invokeEdgeFunction<UsageLimitResult>('usage-limit', { action })
}

export async function checkUsageLimit(
  fallbackProfile?: UserProfile | null,
): Promise<UsageLimitResult> {
  try {
    return await invokeUsageLimit('check')
  } catch (err) {
    if (fallbackProfile) {
      return getUsageFromProfile(fallbackProfile)
    }
    throw err
  }
}

export async function incrementUsage(
  fallbackProfile?: UserProfile | null,
): Promise<UsageLimitResult> {
  try {
    return await invokeUsageLimit('increment')
  } catch (err) {
    if (fallbackProfile) {
      const local = getUsageFromProfile(fallbackProfile)
      if (!local.allowed) return local
    }
    throw err
  }
}

export function formatUsageResetDate(isoDate: string | null): string {
  if (!isoDate) return ''
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export async function hasActiveSession(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return Boolean(session?.access_token)
}
