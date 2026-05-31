import { Button } from '@/components/ui/Button'
import { CrownIcon } from '@/components/ui/icons'
import { formatPlanPrice, getPlanById, type BillingPeriod } from '@/lib/pricing'

type PricingStickyCtaProps = {
  visible: boolean
  onUpgrade: () => void
  billingPeriod: BillingPeriod
}

export function PricingStickyCta({
  visible,
  onUpgrade,
  billingPeriod,
}: PricingStickyCtaProps) {
  if (!visible) return null

  const plan = getPlanById('pro-creator')
  const { amount, suffix } = formatPlanPrice(plan, billingPeriod)

  return (
    <div
      className="pricing-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-fuchsia-500/25 bg-zinc-950/92 px-3 py-2.5 backdrop-blur-xl lg:hidden"
      role="region"
      aria-label="Schnell-Upgrade"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-fuchsia-400">
            Beliebteste Wahl
          </p>
          <p className="truncate text-[13px] font-semibold text-white">
            Pro Creator · {amount}
            {suffix && <span className="font-normal text-zinc-500">{suffix}</span>}
          </p>
        </div>
        <Button
          variant="pro"
          size="md"
          className="btn-glow-pro shrink-0 px-3 text-xs"
          onClick={onUpgrade}
        >
          <CrownIcon className="size-3.5" aria-hidden />
          Pro Creator
        </Button>
      </div>
    </div>
  )
}
