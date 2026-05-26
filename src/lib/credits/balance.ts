import { isAdminEmail } from '@/lib/admin'
import { isUnlimitedPlan, planMonthlyCredits, type PlanId } from '@/lib/plans'
import { resolveUserPlan } from '@/lib/subscription'
import type { UserProfile } from '@/types/subscription'
import type { CreditConsumeResult } from '@/types/credits'

/**
 * Client-side read-only estimate. Never used for enforcement —
 * always call consumeCredits() / checkCredits() server-side.
 */
export function getRemainingCredits(
  profile: UserProfile | null,
  email?: string | null,
): CreditConsumeResult {
  if (isAdminEmail(email)) {
    return {
      allowed: true,
      unlimited: true,
      used: profile?.monthly_usage_count ?? 0,
      remaining: null,
      limit: null,
      usageResetDate: profile?.usage_reset_date ?? null,
      plan: 'founder',
    }
  }

  if (!profile) {
    const freeLimit = planMonthlyCredits('free') ?? 25
    return {
      allowed: false,
      unlimited: false,
      used: 0,
      remaining: 0,
      limit: freeLimit,
      usageResetDate: null,
      plan: 'free',
    }
  }

  const plan = resolveUserPlan(profile, email)
  const used = profile.monthly_usage_count ?? 0
  const resetDate = profile.usage_reset_date ?? null

  if (isUnlimitedPlan(plan)) {
    return {
      allowed: true,
      unlimited: true,
      used,
      remaining: null,
      limit: null,
      usageResetDate: resetDate,
      plan,
    }
  }

  const limit = planMonthlyCredits(plan) ?? planMonthlyCredits('free') ?? 25
  const remaining = Math.max(0, profile.credit_balance ?? 0)

  return {
    allowed: remaining > 0,
    unlimited: false,
    used,
    remaining,
    limit,
    usageResetDate: resetDate,
    plan,
  }
}

export function creditsUsagePercent(result: CreditConsumeResult): number {
  if (result.unlimited || result.limit == null || result.remaining == null) {
    return 0
  }
  const used = Math.max(0, result.limit - result.remaining)
  return result.limit > 0 ? Math.round((used / result.limit) * 100) : 0
}

export function isCreditsDepleted(result: CreditConsumeResult): boolean {
  return !result.unlimited && (result.remaining ?? 0) <= 0
}

export function isCreditsLow(result: CreditConsumeResult, threshold = 5): boolean {
  return !result.unlimited &&
    (result.remaining ?? 0) > 0 &&
    (result.remaining ?? 0) <= threshold
}

export function planLabelForCredits(plan: PlanId): string {
  if (isUnlimitedPlan(plan)) return 'Unlimited'
  const monthly = planMonthlyCredits(plan)
  return monthly != null ? `${monthly.toLocaleString('de-DE')} / month` : '—'
}
