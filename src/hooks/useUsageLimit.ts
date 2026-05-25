import { useCallback } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import type { UsageLimitResult } from '@/types/usage'

type ConsumeActivity = {
  tool: string
  label: string
  cost?: number
}

/** Convenience hook für Credit-Limits (Free: wöchentliche Aufladung, Pro: unlimited). */
export function useUsageLimit() {
  const {
    usage,
    hasProAccess,
    isAdmin,
    isUsageLimitReached,
    isCreditsLow,
    consumeUsage,
    refreshUsage,
    openUpgradeModal,
    openStripeCheckout,
  } = useSubscription()

  /** Block new generations at 0 credits and show the Pro modal. */
  const requireCredits = useCallback((): boolean => {
    if (hasProAccess) return true
    if (isUsageLimitReached) {
      openUpgradeModal()
      return false
    }
    return true
  }, [hasProAccess, isUsageLimitReached, openUpgradeModal])

  /** Deduct one credit after a successful generation (no-op for Pro). */
  const consumeCreditAfterSuccess = useCallback(
    async (activity: ConsumeActivity): Promise<UsageLimitResult | null> => {
      if (hasProAccess) return null
      return consumeUsage(activity)
    },
    [hasProAccess, consumeUsage],
  )

  return {
    usage,
    hasProAccess,
    isAdmin,
    isUsageLimitReached,
    isCreditsLow,
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
