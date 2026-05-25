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
    <div className="dashboard-os-account-card dashboard-os-card glass-premium animate-fade-in animation-delay-100 rounded-2xl border border-zinc-800/55 p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white">Subscription</h3>
          <p className="dashboard-os-muted mt-0.5 text-xs">Manage plan & upgrades</p>
        </div>
        <Badge
          variant={isAdmin ? 'admin' : hasProAccess ? 'pro' : 'muted'}
          className={cn(
            'shrink-0 capitalize',
            isAdmin && 'shadow-[0_0_20px_-6px_rgba(139,92,246,0.5)]',
          )}
        >
          {statusLabel}
        </Badge>
      </div>

      <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Current plan
        </p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-white">{planLabel}</p>

        <ul className="mt-4 space-y-2 text-xs text-zinc-400 sm:text-sm">
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
          muted ? 'bg-zinc-600' : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
        )}
        aria-hidden
      />
      {children}
    </li>
  )
}
