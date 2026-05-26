import { invokeEdgeFunction } from './edgeFunctions'
import { SIGNUP_CREDITS, MAX_FREE_CREDITS } from './constants'
import { getAdminUsageResult, isAdminEmail } from '@/lib/admin'
import { hasUnlimitedCredits, resolveUserPlan } from './subscription'
import { planMonthlyCredits, toolSlugToUsageAction } from '@/lib/plans'
import { checkCredits, consumeCredits } from '@/lib/credits/consume'
import { supabase } from './supabase'
import type { UserProfile } from '@/types/subscription'
import type { UsageLimitResult } from '@/types/usage'

export { MAX_FREE_CREDITS, SIGNUP_CREDITS }

export function getUsageFromProfile(
  profile: UserProfile | null,
  email?: string | null,
): UsageLimitResult {
  if (!profile) {
    if (isAdminEmail(email)) {
      return getAdminUsageResult()
    }
    const freeLimit = planMonthlyCredits('free') ?? SIGNUP_CREDITS
    return {
      allowed: false,
      unlimited: false,
      used: 0,
      remaining: 0,
      limit: freeLimit,
      usageResetDate: null,
    }
  }

  const used = profile.monthly_usage_count ?? 0
  const usageResetDate = profile.usage_reset_date ?? null

  if (isAdminEmail(email)) {
    return getAdminUsageResult(used, usageResetDate)
  }

  const plan = resolveUserPlan(profile, email)

  if (hasUnlimitedCredits(profile, email)) {
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
  const limit = planMonthlyCredits(plan) ?? planMonthlyCredits('free') ?? SIGNUP_CREDITS

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

/** @deprecated Prefer checkCredits() from @/lib/credits */
export async function checkUsageLimit(
  fallbackProfile?: UserProfile | null,
): Promise<UsageLimitResult> {
  try {
    return await checkCredits()
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
  idempotency_key?: string
}

export async function logGenerationUsage(
  meta: UsageGenerationMeta,
): Promise<string | null> {
  try {
    const result = await invokeEdgeFunction<UsageLimitResult & { generationId?: string | null }>(
      'usage-limit',
      {
        action: 'log_generation',
        ...meta,
        credits_used: meta.credits_used ?? 1,
        status: meta.status ?? 'completed',
      },
    )
    return result.generationId ?? null
  } catch (err) {
    console.warn('[usage] logGenerationUsage failed', err)
    return null
  }
}

/** Deduct credits via consume-credits edge function (atomic RPC). */
export async function incrementUsage(
  fallbackProfile?: UserProfile | null,
  cost = 1,
  meta?: UsageGenerationMeta,
): Promise<UsageLimitResult> {
  try {
    const actionId = meta?.tool ? toolSlugToUsageAction(meta.tool) : 'hook_generation'

    return await consumeCredits(actionId, {
      cost,
      tool: meta?.tool,
      label: meta?.label,
      niche: meta?.niche,
      platform: meta?.platform,
      prompt: meta?.prompt,
      generation_type: meta?.generation_type,
      skip_analytics_log: meta?.skip_analytics_log,
      idempotency_key: meta?.idempotency_key,
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
