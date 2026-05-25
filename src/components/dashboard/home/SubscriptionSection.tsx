import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CrownIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import {
  MAX_FREE_CREDITS,
  PRO_PRICE_LABEL,
  SIGNUP_CREDITS,
  WEEKLY_REFILL_CREDITS,
} from '@/lib/constants'
import { cn } from '@/lib'

export function SubscriptionSection() {
  const {
    hasProAccess,
    isAdmin,
    planLabel,
    statusLabel,
    openUpgradeModal,
    openStripeCheckout,
    manageSubscription,
  } = useDashboardData()

  return (
    <div className="dashboard-os-account-card dashboard-os-card overflow-hidden rounded-2xl border border-zinc-800/55 bg-zinc-900/30">
      <div className="border-b border-zinc-800/50 px-3 py-3 sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-white">Subscription</h3>
            <p className="dashboard-os-muted mt-0.5 text-[11px]">Plan & billing</p>
          </div>
          <Badge
            variant={isAdmin ? 'admin' : hasProAccess ? 'pro' : 'muted'}
            className="shrink-0 capitalize"
          >
            {statusLabel}
          </Badge>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Current plan
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">{planLabel}</p>

          <ul className="mt-4 space-y-2.5 text-xs text-zinc-400 sm:text-sm">
            {isAdmin || hasProAccess ? (
              <>
                <FeatureItem>Unlimited credits</FeatureItem>
                <FeatureItem>All premium tools</FeatureItem>
                <FeatureItem>Priority AI access</FeatureItem>
              </>
            ) : (
              <>
                <FeatureItem muted>
                  {SIGNUP_CREDITS} start · +{WEEKLY_REFILL_CREDITS}/week (max {MAX_FREE_CREDITS})
                </FeatureItem>
                <FeatureItem muted>All AI tools with credits</FeatureItem>
                <FeatureItem muted>Trend scouting included</FeatureItem>
              </>
            )}
          </ul>
        </div>

        <div className="mt-4 flex flex-col gap-2">
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
              onClick={hasProAccess ? manageSubscription : openUpgradeModal}
            >
              {hasProAccess ? 'Manage subscription' : 'Compare plans'}
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
          muted ? 'bg-zinc-600' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]',
        )}
        aria-hidden
      />
      {children}
    </li>
  )
}
