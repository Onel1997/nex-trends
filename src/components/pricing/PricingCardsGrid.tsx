import { useMemo } from 'react'
import { PricingCard } from '@/components/pricing/PricingCard'
import {
  PRICING_PLANS,
  PUBLIC_PRICING_PLANS,
  type BillingPeriod,
  type PlanTierId,
} from '@/lib/pricing'
import { cn } from '@/lib'

type PricingCardsGridProps = {
  period: BillingPeriod
  currentPlanId: PlanTierId
  isAdmin: boolean
  onSelectPlan: (planId: PlanTierId) => void
}

const PLAN_DISPLAY_ORDER: PlanTierId[] = [
  'free',
  'creator',
  'pro-creator',
  'studio',
  'agency',
  'admin',
]

export function PricingCardsGrid({
  period,
  currentPlanId,
  isAdmin,
  onSelectPlan,
}: PricingCardsGridProps) {
  const plans = useMemo(() => {
    const visible = PUBLIC_PRICING_PLANS.filter((p) => !p.internalOnly)
    const adminPlan = PRICING_PLANS.find((p) => p.id === 'admin')
    const merged = isAdmin && adminPlan ? [...visible, adminPlan] : visible
    return PLAN_DISPLAY_ORDER.map((id) => merged.find((p) => p.id === id)).filter(
      (p): p is NonNullable<typeof p> => p != null,
    )
  }, [isAdmin])

  return (
    <div
      className={cn(
        'pricing-cards-grid w-full min-w-0 max-w-full grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4',
        plans.length >= 5 ? 'xl:grid-cols-3' : 'lg:grid-cols-3',
      )}
    >
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          period={period}
          currentPlanId={currentPlanId}
          isAdmin={isAdmin}
          onSelect={onSelectPlan}
          className={cn(
            'w-full min-w-0 max-w-full',
            plan.featured && 'sm:col-span-2 xl:col-span-1 pricing-card--popular',
            plan.id === 'admin' && 'sm:col-span-2 xl:col-span-1',
          )}
        />
      ))}
    </div>
  )
}
