import { useCallback } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { hasFeatureAccess as checkPlanFeature, type FeatureId } from '@/lib/plans/feature-access'
import type { UsageLimitResult } from '@/types/usage'

type ConsumeActivity = {
  tool: string
  label: string
  cost?: number
  niche?: string
  platform?: string
  prompt?: string
  generation_type?: 'text' | 'video' | 'audio' | 'search' | 'image'
  skip_analytics_log?: boolean
}

/** Convenience hook für Credit-Limits und Feature-Gates. */
export function useUsageLimit() {
  const {
    usage,
    hasProAccess,
    userPlan,
    isAdmin,
    isUsageLimitReached,
    isCreditsLow,
    consumeUsage,
    refreshUsage,
    openUpgradeModal,
    openStripeCheckout,
  } = useSubscription()

  const canUseFeature = useCallback(
    (feature: FeatureId | string) => isAdmin || checkPlanFeature(userPlan, feature),
    [isAdmin, userPlan],
  )

  const requireCredits = useCallback((): boolean => {
    if (usage.unlimited) return true
    if (isUsageLimitReached) {
      openUpgradeModal()
      return false
    }
    return true
  }, [usage.unlimited, isUsageLimitReached, openUpgradeModal])

  const consumeCreditAfterSuccess = useCallback(
    async (activity: ConsumeActivity): Promise<UsageLimitResult | null> => {
      return consumeUsage(activity)
    },
    [consumeUsage],
  )

  return {
    usage,
    hasProAccess,
    userPlan,
    isAdmin,
    isUsageLimitReached,
    isCreditsLow,
    canUseFeature,
    consumeUsage,
    requireCredits,
    consumeCreditAfterSuccess,
    refreshUsage,
    openUpgradeModal,
    openStripeCheckout,
    remaining: usage.remaining,
    used: usage.used,
    limit: usage.limit,
    unlimited: usage.unlimited,
    usageResetDate: usage.usageResetDate,
  }
}
