import { useSubscription } from '@/hooks/useSubscription'

/** Convenience hook für Usage-Limits (Free: 5/Monat, Pro: unlimited). */
export function useUsageLimit() {
  const {
    usage,
    hasProAccess,
    isUsageLimitReached,
    consumeUsage,
    refreshUsage,
    openUpgradeModal,
    openStripeCheckout,
  } = useSubscription()

  return {
    usage,
    hasProAccess,
    isUsageLimitReached,
    consumeUsage,
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
