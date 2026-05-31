import { useCallback, useState } from 'react'
import type { BillingPeriod, PlanTierId } from '@/lib/pricing'
import { isBelowFeaturedPlan, planTierFromProfile } from '@/lib/pricing'
import { pricingTierToPlanId } from '@/lib/plans'
import { useSubscription } from '@/hooks/useSubscription'

export function usePricingActions() {
  const { isAdmin, openStripeCheckout, userPlan } = useSubscription()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [upgradePlanId, setUpgradePlanId] = useState<PlanTierId | null>(null)

  const currentPlanId = planTierFromProfile(false, isAdmin, userPlan)
  const showUpgradeCta = !isAdmin && isBelowFeaturedPlan(currentPlanId)

  const handleSelectPlan = useCallback(
    (planId: PlanTierId) => {
      if (planId === 'free' || planId === currentPlanId) return
      if (planId === 'admin') return

      if (planId === 'agency') {
        window.location.href =
          'mailto:agency@nextrends.ai?subject=NexTrends%20Agency%20Plan'
        return
      }

      const saasPlan = pricingTierToPlanId(planId)
      void openStripeCheckout({ planId: saasPlan, billingPeriod })
      setUpgradePlanId(planId)
    },
    [billingPeriod, currentPlanId, openStripeCheckout],
  )

  const closeUpgradeModal = useCallback(() => {
    setUpgradePlanId(null)
  }, [])

  const handleFeaturedUpgrade = useCallback(() => {
    if (isAdmin) return
    setUpgradePlanId('pro-creator')
  }, [isAdmin])

  return {
    billingPeriod,
    setBillingPeriod,
    currentPlanId,
    upgradePlanId,
    handleSelectPlan,
    closeUpgradeModal,
    handleFeaturedUpgrade,
    showUpgradeCta,
    isAdmin,
    userPlan,
  }
}
