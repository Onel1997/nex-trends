import { useCallback, useMemo } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import {
  canAccessFeature,
  canAccessRoute,
  getRouteUpgradePlan,
  PLAN_LABELS,
  type FeatureFlag,
} from '@/lib/plans'
import type { DashboardRouteId } from '@/lib/routes'

export function usePlanAccess() {
  const { userPlan, isAdmin, openStripeCheckout, openUpgradeModal } = useSubscription()

  const planLabel = PLAN_LABELS[userPlan]

  const canAccess = useCallback(
    (routeId: DashboardRouteId) => canAccessRoute(userPlan, routeId),
    [userPlan],
  )

  const canUseFeature = useCallback(
    (feature: FeatureFlag) => canAccessFeature(userPlan, feature),
    [userPlan],
  )

  const hasFeatureAccess = canUseFeature

  const requestUpgrade = useCallback(
    (routeId?: DashboardRouteId) => {
      if (isAdmin) return
      const planId = routeId ? getRouteUpgradePlan(routeId) : 'pro_creator'
      void openStripeCheckout({ planId })
    },
    [isAdmin, openStripeCheckout],
  )

  return useMemo(
    () => ({
      userPlan,
      planLabel,
      isAdmin,
      canAccess,
      canUseFeature,
      hasFeatureAccess,
      requestUpgrade,
      openUpgradeModal,
    }),
    [
      userPlan,
      planLabel,
      isAdmin,
      canAccess,
      canUseFeature,
      hasFeatureAccess,
      requestUpgrade,
      openUpgradeModal,
    ],
  )
}
