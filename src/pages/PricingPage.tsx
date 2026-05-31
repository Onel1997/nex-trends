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
    showUpgradeCta,
    isAdmin,
  } = usePricingActions()

  return (
    <div className="dashboard-os pricing-os nex-os-polish relative mx-auto w-full min-w-0 max-w-6xl pb-[4.5rem] sm:pb-20 lg:pb-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="pricing-glow pricing-glow--1" />
        <div className="pricing-glow pricing-glow--2" />
      </div>

      <div className="dashboard-os__content relative flex flex-col gap-3 sm:gap-5">
        <header className="pricing-hero text-center sm:text-left">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-400">
            NexTrends AI OS · Preise
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Creator-Pläne für jedes Wachstumsstadium
          </h1>
          <p className="dashboard-os-muted mx-auto mt-1 max-w-2xl text-[11px] leading-relaxed sm:mx-0 sm:text-xs">
            Vom ersten viralen Trend bis zur Agentur-Skalierung — wähle den Workspace,
            der zu deinem Output passt. Jederzeit upgraden, jederzeit kündigen.
          </p>
        </header>

        <ScrollReveal delay={60}>
          <PricingBillingToggle
            value={billingPeriod}
            onChange={setBillingPeriod}
            className="py-0.5"
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
            title="Features vergleichen"
            description="Alles im Überblick — Plan für Plan"
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
            showUpgradeCta={showUpgradeCta}
            isAdmin={isAdmin}
          />
        </ScrollReveal>
      </div>

      <PricingStickyCta
        visible={showUpgradeCta}
        onUpgrade={handleFeaturedUpgrade}
        billingPeriod={billingPeriod}
      />

      <PlanUpgradeModal
        planId={upgradePlanId}
        billingPeriod={billingPeriod}
        onClose={closeUpgradeModal}
      />
    </div>
  )
}
