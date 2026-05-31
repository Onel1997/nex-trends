import { CrownIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/Button'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { navigateToTool } from '@/lib/navigation'

export function TrendProUpsell() {
  const { canUseFeature, userPlan } = useUsageLimit()

  if (canUseFeature('viral_frameworks')) return null

  return (
    <aside className="mt-6 animate-fade-in rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-violet-950/80 via-zinc-950/90 to-fuchsia-950/40 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
          Pro Creator
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-white sm:text-lg">
          Unbegrenzte Trend Intelligence
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          Virale Frameworks, Landing Page Analyzer, erweiterte Analytics und priorisierte KI-Generierung.
        </p>
      </div>
      <Button
        variant="pro"
        size="lg"
        className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
        onClick={() => navigateToTool('pricing')}
      >
        <CrownIcon className="size-4" aria-hidden />
        {userPlan === 'free' ? 'Pro Creator · 49 €/Mo.' : 'Pläne vergleichen'}
      </Button>
    </aside>
  )
}
