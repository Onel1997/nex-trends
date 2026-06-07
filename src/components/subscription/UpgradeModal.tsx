import { PlanUpgradeModal } from '@/components/pricing/PlanUpgradeModal'
import { useSubscription } from '@/hooks/useSubscription'

/** Global upgrade modal — opens Pro Creator checkout flow */
export function UpgradeModal() {
  const { isUpgradeModalOpen, closeUpgradeModal } = useSubscription()

  return (
    <PlanUpgradeModal
      planId={isUpgradeModalOpen ? 'pro-creator' : null}
      billingPeriod="monthly"
      onClose={closeUpgradeModal}
    />
  )
}
