import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { PricingBillingToggle } from '@/components/pricing/PricingBillingToggle'
import { PricingCardsGrid } from '@/components/pricing/PricingCardsGrid'
import { PricingComparisonTable } from '@/components/pricing/PricingComparisonTable'
import { PricingCreditUsage } from '@/components/pricing/PricingCreditUsage'
import { PricingCtaSection } from '@/components/pricing/PricingCtaSection'
import { PricingEnterpriseSection } from '@/components/pricing/PricingEnterpriseSection'
import { PlanUpgradeModal } from '@/components/pricing/PlanUpgradeModal'
import { PricingStickyCta } from '@/components/pricing/PricingStickyCta'
import { usePricingActions } from '@/components/pricing/usePricingActions'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function PricingPage() {
  const {
    billingPeriod,
    setBillingPeriod,
    currentPlanId,
    upgradePlanId,
    handleSelectPlan,
    closeUpgradeModal,
    handleFeaturedUpgrade,
    hasProAccess,
    isAdmin,
  } = usePricingActions()

  return (
    <div className="dashboard-os pricing-os nex-os-polish relative mx-auto w-full min-w-0 max-w-6xl pb-20 lg:pb-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="pricing-glow pricing-glow--1" />
        <div className="pricing-glow pricing-glow--2" />
      </div>

      <div className="dashboard-os__content relative flex flex-col gap-4 sm:gap-5">
        <header className="pricing-hero text-center sm:text-left">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-400">
            NexTrends AI OS · Pricing
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Creator economy plans
          </h1>
          <p className="dashboard-os-muted mx-auto mt-1 max-w-2xl text-[11px] leading-relaxed sm:mx-0 sm:text-xs">
            From first viral trend to agency-scale delivery — pick the workspace that
            matches your output. Upgrade anytime, cancel anytime.
          </p>
        </header>

        <ScrollReveal delay={60}>
          <PricingBillingToggle
            value={billingPeriod}
            onChange={setBillingPeriod}
            className="py-1"
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <PricingCardsGrid
            period={billingPeriod}
            currentPlanId={currentPlanId}
            isAdmin={isAdmin}
            onSelectPlan={handleSelectPlan}
          />
        </ScrollReveal>

        <ScrollReveal delay={140}>
          <DashboardSectionHeading
            title="Compare features"
            description="Everything included, plan by plan"
          />
          <PricingComparisonTable highlightPlanId="pro-creator" />
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <PricingCreditUsage />
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <PricingEnterpriseSection onContact={handleSelectPlan} />
        </ScrollReveal>

        <ScrollReveal delay={260}>
          <PricingCtaSection
            onUpgrade={handleFeaturedUpgrade}
            hasProAccess={hasProAccess}
            isAdmin={isAdmin}
          />
        </ScrollReveal>
      </div>

      <PricingStickyCta
        visible={!isAdmin && !hasProAccess}
        onUpgrade={handleFeaturedUpgrade}
      />

      <PlanUpgradeModal
        planId={upgradePlanId}
        billingPeriod={billingPeriod}
        onClose={closeUpgradeModal}
      />
    </div>
  )
}
