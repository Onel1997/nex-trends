import { invokeEdgeFunction } from './edgeFunctions'
import {
  MAX_FREE_CREDITS,
  SIGNUP_CREDITS,
  FREE_MONTHLY_AI_LIMIT,
} from './constants'
import { getAdminUsageResult, isAdminEmail } from '@/lib/admin'
import { hasProAccess, resolveUserPlan } from './subscription'
import { isUnlimitedPlan, toolSlugToUsageAction } from '@/lib/plans'
import { supabase } from './supabase'
import type { UserProfile } from '@/types/subscription'
import type { UsageAction, UsageLimitResult } from '@/types/usage'

export { FREE_MONTHLY_AI_LIMIT, MAX_FREE_CREDITS, SIGNUP_CREDITS }

export function getUsageFromProfile(
  profile: UserProfile | null,
  email?: string | null,
): UsageLimitResult {
  if (!profile) {
    if (isAdminEmail(email)) {
      return getAdminUsageResult()
    }
    return {
      allowed: false,
      unlimited: false,
      used: 0,
      remaining: 0,
      limit: MAX_FREE_CREDITS,
      usageResetDate: null,
    }
  }

  const used = profile.monthly_usage_count ?? 0
  const usageResetDate = profile.usage_reset_date ?? null

  if (isAdminEmail(email)) {
    return getAdminUsageResult(used, usageResetDate)
  }

  const plan = resolveUserPlan(profile, email)

  if (isUnlimitedPlan(plan) && hasProAccess(profile)) {
    return {
      allowed: true,
      unlimited: true,
      used,
      remaining: null,
      limit: null,
      usageResetDate,
      plan,
    }
  }

  const remaining = Math.max(0, profile.credit_balance ?? 0)
  const limit = plan === 'creator' ? 50 : MAX_FREE_CREDITS

  return {
    allowed: remaining > 0,
    unlimited: false,
    used,
    remaining,
    limit,
    usageResetDate,
    plan,
  }
}

async function invokeUsageLimit(
  action: UsageAction,
  extra?: Record<string, unknown>,
): Promise<UsageLimitResult> {
  return invokeEdgeFunction<UsageLimitResult>('usage-limit', { action, ...extra })
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

export type UsageGenerationMeta = {
  tool?: string
  label?: string
  niche?: string
  platform?: string
  prompt?: string
  credits_used?: number
  generation_type?: 'text' | 'video' | 'audio' | 'search' | 'image'
  status?: 'queued' | 'generating' | 'completed' | 'failed'
  output_url?: string
  error_message?: string
  skip_analytics_log?: boolean
}

export async function logGenerationUsage(
  meta: UsageGenerationMeta,
): Promise<string | null> {
  try {
    const result = await invokeUsageLimit('log_generation', {
      ...meta,
      credits_used: meta.credits_used ?? 1,
      status: meta.status ?? 'completed',
    }) as UsageLimitResult & { generationId?: string | null }
    return result.generationId ?? null
  } catch (err) {
    console.warn('[usage] logGenerationUsage failed', err)
    return null
  }
}

export async function incrementUsage(
  fallbackProfile?: UserProfile | null,
  cost = 1,
  meta?: UsageGenerationMeta,
): Promise<UsageLimitResult> {
  try {
    const actionId = meta?.tool ? toolSlugToUsageAction(meta.tool) : undefined

    return await invokeUsageLimit('increment', {
      cost,
      action_id: actionId,
      ...meta,
    })
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
