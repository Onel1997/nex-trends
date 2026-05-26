import { useCallback, useMemo } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import {
  checkCredits,
  consumeCredits,
  consumeCreditsForTool,
  creditsUsagePercent,
  getFeatureCreditCost,
  getRemainingCredits,
  isCreditsDepleted,
  isCreditsLow,
} from '@/lib/credits'
import { hasUnlimitedCredits } from '@/lib/subscription'
import type { UsageActionId } from '@/lib/plans'
import type { ConsumeCreditsPayload, CreditConsumeResult } from '@/types/credits'

/**
 * Primary hook for creator credits. Balance is always refreshed from the server
 * after consumption — never trust local profile.credit_balance alone.
 */
export function useCredits() {
  const {
    profile,
    usage,
    session,
    isAdmin,
    refreshUsage,
    openUpgradeModal,
    openStripeCheckout,
    userPlan,
  } = useSubscription()

  const email = session?.user?.email
  const unlimited = hasUnlimitedCredits(profile, email) || usage.unlimited

  const localEstimate = useMemo(
    () => getRemainingCredits(profile, email),
    [profile, email],
  )

  const remaining = usage.remaining ?? localEstimate.remaining
  const limit = usage.limit ?? localEstimate.limit
  const used = usage.used ?? localEstimate.used
  const usageResetDate = usage.usageResetDate ?? localEstimate.usageResetDate

  const percentUsed = useMemo(
    () => creditsUsagePercent({ ...usage, remaining, limit, unlimited }),
    [usage, remaining, limit, unlimited],
  )

  const depleted = !unlimited && isCreditsDepleted({ ...usage, remaining, unlimited })
  const low = !unlimited && isCreditsLow({ ...usage, remaining, unlimited })

  const refresh = useCallback(async () => {
    return refreshUsage()
  }, [refreshUsage])

  const requireCredits = useCallback(
    (minCost = 1): boolean => {
      if (unlimited) return true
      if ((remaining ?? 0) < minCost) {
        openUpgradeModal()
        return false
      }
      return true
    },
    [unlimited, remaining, openUpgradeModal],
  )

  const consume = useCallback(
    async (
      feature: UsageActionId | string,
      options?: Omit<ConsumeCreditsPayload, 'feature'>,
    ): Promise<CreditConsumeResult> => {
      if (isAdmin) {
        return {
          allowed: true,
          unlimited: true,
          used,
          remaining: null,
          limit: null,
          usageResetDate,
          plan: 'founder',
        }
      }

      const result = await consumeCredits(feature, options)
      await refreshUsage()

      if (!result.allowed && !result.unlimited) {
        openUpgradeModal()
      }

      return result
    },
    [isAdmin, used, usageResetDate, refreshUsage, openUpgradeModal],
  )

  const consumeForTool = useCallback(
    async (toolSlug: string, meta?: Omit<ConsumeCreditsPayload, 'feature'>) => {
      if (isAdmin) {
        return consume('hook_generation', meta)
      }
      const result = await consumeCreditsForTool(toolSlug, meta)
      await refreshUsage()
      if (!result.allowed) openUpgradeModal()
      return result
    },
    [isAdmin, consume, refreshUsage, openUpgradeModal],
  )

  const check = useCallback(async () => {
    const result = await checkCredits()
    await refreshUsage()
    return result
  }, [refreshUsage])

  return {
    profile,
    userPlan,
    unlimited,
    isAdmin,
    remaining,
    limit,
    used,
    usageResetDate,
    percentUsed,
    depleted,
    low,
    localEstimate,
    getFeatureCreditCost,
    getRemainingCredits: () => getRemainingCredits(profile, email),
    requireCredits,
    consume,
    consumeForTool,
    check,
    refresh,
    openUpgradeModal,
    openStripeCheckout,
  }
}
