import { useCallback } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
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

  /** Deduct credit after success; Pro/Admin only logs analytics (no charge). */
  const consumeCreditAfterSuccess = useCallback(
    async (activity: ConsumeActivity): Promise<UsageLimitResult | null> => {
      return consumeUsage(activity)
    },
    [consumeUsage],
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
