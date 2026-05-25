import { CrownIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/Button'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { PRO_PRICE_LABEL } from '@/lib/constants'

export function TrendProUpsell() {
  const { hasProAccess, openStripeCheckout } = useUsageLimit()

  if (hasProAccess) return null

  return (
    <aside className="mt-6 animate-fade-in rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/80 via-zinc-950/90 to-fuchsia-950/40 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          NexTrends Pro
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg">
          Unbegrenzte Trend Intelligence
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          Alle Tools ohne Credit-Limit, tiefere Analysen und priorisierter KI-Zugriff.
        </p>
      </div>
      <Button
        variant="pro"
        size="lg"
        className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
        onClick={() => void openStripeCheckout()}
      >
        <CrownIcon className="size-4" aria-hidden />
        Pro · {PRO_PRICE_LABEL}
      </Button>
    </aside>
  )
}
