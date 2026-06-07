import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { CrownIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { PlanBadge } from '@/components/billing/PlanBadge'
import { useSubscription } from '@/hooks/useSubscription'
import { navigateToTool } from '@/lib/navigation'
import { formatUiCreditAllowance } from '@/lib/credits/display'
import { PRO_PRICE_LABEL } from '@/lib/constants'
import { cn } from '@/lib'

export function SubscriptionSection() {
  const {
    hasProAccess,
    isAdmin,
    planLabel,
    openStripeCheckout,
    manageSubscription,
  } = useDashboardData()
  const { userPlan } = useSubscription()

  return (
    <div className="dashboard-os-account-card dashboard-os-account-panel overflow-hidden">
      <div className="border-b border-zinc-800/45 px-2.5 py-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[13px] font-semibold text-white">Subscription</h3>
            <p className="dashboard-os-muted mt-0.5 text-[10px]">Plan & billing</p>
          </div>
          <PlanBadge plan={userPlan} className="shrink-0 text-[8px]" />
        </div>
      </div>

      <div className="p-2.5">
        <div
          className={cn(
            'rounded-[var(--dash-radius)] border p-2.5',
            isAdmin
              ? 'border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-zinc-950/80'
              : 'border-zinc-800/50 bg-zinc-950/70',
          )}
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Current plan
          </p>
          <p
            className={cn(
              'mt-1 text-base font-semibold tracking-tight',
              isAdmin ? 'text-amber-100' : 'text-white',
            )}
          >
            {planLabel}
          </p>
          {isAdmin && (
            <p className="mt-1 text-[10px] text-amber-200/70">
              Full platform access · Priority infrastructure
            </p>
          )}

          <ul className="mt-3 space-y-2 text-[11px] text-zinc-400">
            {isAdmin || hasProAccess ? (
              <>
                <FeatureItem>{formatUiCreditAllowance(userPlan, isAdmin)}</FeatureItem>
                <FeatureItem>All premium tools</FeatureItem>
                <FeatureItem>Priority AI access</FeatureItem>
              </>
            ) : (
              <>
                <FeatureItem muted>
                  {formatUiCreditAllowance('free')} on Free
                </FeatureItem>
                <FeatureItem muted>All AI tools with credits</FeatureItem>
                <FeatureItem muted>Trend scouting included</FeatureItem>
              </>
            )}
          </ul>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {!isAdmin && !hasProAccess && (
            <Button variant="pro" fullWidth onClick={() => void openStripeCheckout()}>
              <CrownIcon className="size-4" />
              Upgrade · {PRO_PRICE_LABEL}
            </Button>
          )}
          {!isAdmin && (
            <Button
              variant="secondary"
              fullWidth
              onClick={
                hasProAccess
                  ? manageSubscription
                  : () => navigateToTool('pricing')
              }
            >
              {hasProAccess ? 'Manage subscription' : 'View all plans'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function FeatureItem({
  children,
  muted = false,
}: {
  children: ReactNode
  muted?: boolean
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          muted ? 'bg-zinc-600' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]',
        )}
        aria-hidden
      />
      {children}
    </li>
  )
}
