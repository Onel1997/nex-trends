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
    <>
      {/* Mobile: horizontal snap carousel */}
      <div className="pricing-cards-carousel -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 scrollbar-hide snap-x snap-mandatory sm:hidden">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            period={period}
            currentPlanId={currentPlanId}
            isAdmin={isAdmin}
            onSelect={onSelectPlan}
            className={cn(
              'pricing-card--mobile w-[min(82vw,18rem)] shrink-0 snap-center',
              plan.featured && 'pricing-card--popular',
            )}
          />
        ))}
      </div>

      {/* Tablet+ grid */}
      <div
        className={cn(
          'pricing-cards-grid hidden w-full min-w-0 gap-3 sm:grid sm:gap-4',
          'sm:grid-cols-2',
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
              plan.featured && 'sm:col-span-2 xl:col-span-1',
              plan.id === 'admin' && 'sm:col-span-2 xl:col-span-1',
            )}
          />
        ))}
      </div>
    </>
  )
}
