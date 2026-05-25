import { Button } from '@/components/ui/Button'
import { SparklesIcon } from '@/components/ui/icons'

type PricingCtaSectionProps = {
  onUpgrade: () => void
  hasProAccess: boolean
  isAdmin: boolean
}

export function PricingCtaSection({
  onUpgrade,
  hasProAccess,
  isAdmin,
}: PricingCtaSectionProps) {
  if (isAdmin) return null

  return (
    <section className="pricing-cta relative overflow-hidden rounded-[var(--dash-radius-lg)] border border-violet-500/20 p-5 sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-emerald-600/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 pricing-cta__shimmer opacity-40"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-300">
          <SparklesIcon className="size-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
            {hasProAccess
              ? 'You’re on a paid plan — unlock the full OS'
              : 'Ready to scale your creator workflow?'}
          </h3>
          <p className="dashboard-os-muted mt-1 text-[11px] sm:text-xs">
            Join thousands of creators using NexTrends AI OS for trend intel, hooks,
            and viral shorts — one workspace, infinite output.
          </p>
        </div>
        {!hasProAccess && (
          <Button variant="pro" size="lg" onClick={onUpgrade} className="shrink-0 sm:min-w-[160px]">
            Upgrade now
          </Button>
        )}
      </div>
    </section>
  )
}
