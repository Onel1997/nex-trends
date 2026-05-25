import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { CloseIcon, CrownIcon, LockIcon } from '@/components/ui/icons'
import {
  ENTERPRISE_CONTACT_EMAIL,
  formatPlanPrice,
  getPlanById,
  type BillingPeriod,
  type PlanTierId,
} from '@/lib/pricing'
import { pricingTierToPlanId } from '@/lib/plans'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib'

type PlanUpgradeModalProps = {
  planId: PlanTierId | null
  billingPeriod: BillingPeriod
  onClose: () => void
}

export function PlanUpgradeModal({
  planId,
  billingPeriod,
  onClose,
}: PlanUpgradeModalProps) {
  const { openStripeCheckout, isProfileLoading, isAdmin } = useSubscription()

  const open = planId !== null && planId !== 'free' && planId !== 'admin'
  const plan = planId ? getPlanById(planId) : null

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !plan) return null

  const { amount, suffix, savings } = formatPlanPrice(plan, billingPeriod)

  const handleCta = () => {
    if (plan.contactOnly) {
      window.location.href = `mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=NexTrends%20${encodeURIComponent(plan.name)}`
      onClose()
      return
    }
    void openStripeCheckout({
      planId: pricingTierToPlanId(plan.id),
      billingPeriod,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-upgrade-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <article
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-t-2xl border border-violet-500/25 bg-zinc-950/95 shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)] backdrop-blur-xl sm:rounded-2xl',
          'animate-fade-in-scale max-sm:max-h-[90dvh] max-sm:overflow-y-auto',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-600/12 via-transparent to-fuchsia-600/6"
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200"
          aria-label="Close"
        >
          <CloseIcon className="size-5" />
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
            <CrownIcon className="size-7" aria-hidden />
          </div>

          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400">
            Upgrade to {plan.name}
          </p>
          <h2
            id="plan-upgrade-title"
            className="mt-1 text-center text-xl font-semibold tracking-tight text-white"
          >
            {amount}
            {suffix && (
              <span className="block text-sm font-normal text-zinc-500">{suffix}</span>
            )}
          </h2>
          {savings && (
            <p className="mt-1 text-center text-xs font-medium text-emerald-400">{savings}</p>
          )}
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
            {plan.tagline}
          </p>

          <ul className="mt-5 max-h-40 space-y-2 overflow-y-auto sm:max-h-48">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.55)]"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant="pro"
            size="lg"
            fullWidth
            loading={isProfileLoading}
            disabled={isProfileLoading || isAdmin}
            onClick={handleCta}
            className="mt-6"
          >
            {plan.contactOnly ? 'Contact sales' : `${plan.cta} →`}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-xl py-2.5 text-sm text-zinc-500 transition-smooth hover:text-zinc-300"
          >
            Not now
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
            <LockIcon className="size-3.5" aria-hidden />
            Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      </article>
    </div>
  )
}
