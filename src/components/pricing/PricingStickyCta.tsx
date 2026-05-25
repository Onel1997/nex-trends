import { Button } from '@/components/ui/Button'
import { CrownIcon } from '@/components/ui/icons'

type PricingStickyCtaProps = {
  visible: boolean
  onUpgrade: () => void
}

export function PricingStickyCta({ visible, onUpgrade }: PricingStickyCtaProps) {
  if (!visible) return null

  return (
    <div
      className="pricing-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-violet-500/20 bg-zinc-950/90 px-4 py-3 backdrop-blur-xl lg:hidden"
      role="region"
      aria-label="Quick upgrade"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-400">
            Most Popular
          </p>
          <p className="truncate text-sm font-semibold text-white">Pro Creator · €49/mo</p>
        </div>
        <Button variant="pro" size="md" className="btn-glow-pro shrink-0" onClick={onUpgrade}>
          <CrownIcon className="size-4" aria-hidden />
          Upgrade
        </Button>
      </div>
    </div>
  )
}
