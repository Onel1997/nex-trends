import { useEffect, useState } from 'react'
import { BillingActivityList, PlanBadge } from '@/components/billing'
import { Button } from '@/components/ui/Button'
import { CrownIcon, CreditIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useSubscription } from '@/hooks/useSubscription'
import { fetchActiveSubscription, fetchUsageLogs } from '@/lib/billing'
import { supabase } from '@/lib/supabase'
import { PLAN_LABELS } from '@/lib/plans'
import { navigateToTool } from '@/lib/navigation'
import { startStripePortalFlow } from '@/lib/stripe'
import type { SubscriptionRow, UsageLogRow } from '@/types/billing'

export function BillingPage() {
  const { userPlan, isAdmin, openStripeCheckout, hasProAccess } = useSubscription()
  const { usage, remainingLabel, resetDateLabel } = useDashboardData()
  const [logs, setLogs] = useState<UsageLogRow[]>([])
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id || !mounted) return
      const [usageLogs, sub] = await Promise.all([
        fetchUsageLogs(user.id, 15),
        fetchActiveSubscription(user.id),
      ])
      if (!mounted) return
      setLogs(usageLogs)
      setSubscription(sub)
      setLoading(false)
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="dashboard-os nex-os-polish relative mx-auto w-full min-w-0 max-w-3xl">
      <header className="mb-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400">
          Billing
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Subscription & usage
        </h1>
        <p className="dashboard-os-muted mt-1 text-[11px] sm:text-xs">
          Manage your plan, credits, and recent AI activity.
        </p>
      </header>

      <div className="space-y-4">
        <section className="dashboard-os-card rounded-[var(--dash-radius-lg)] border border-zinc-800/50 bg-zinc-950/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Current plan
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PlanBadge plan={userPlan} />
                {hasProAccess && !isAdmin && (
                  <span className="text-[10px] text-emerald-400">Active</span>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-300">{PLAN_LABELS[userPlan]} workspace</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
              <CreditIcon className="size-5 text-violet-400" aria-hidden />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Credits</p>
                <p className="text-sm font-semibold text-white">{remainingLabel}</p>
              </div>
            </div>
          </div>

          {resetDateLabel && !usage.unlimited && (
            <p className="dashboard-os-muted mt-3 text-[10px]">Next refill · {resetDateLabel}</p>
          )}

          {subscription?.current_period_end && (
            <p className="dashboard-os-muted mt-1 text-[10px]">
              Renews{' '}
              {new Date(subscription.current_period_end).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!isAdmin && !hasProAccess && (
              <Button
                variant="pro"
                className="btn-glow-pro"
                onClick={() => void openStripeCheckout({ planId: 'pro_creator' })}
              >
                <CrownIcon className="size-4" aria-hidden />
                Upgrade plan
              </Button>
            )}
            {hasProAccess && !isAdmin && (
              <Button variant="secondary" onClick={() => void startStripePortalFlow()}>
                Manage in Stripe
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigateToTool('pricing')}>
              View all plans
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-200">Recent usage</h2>
          {loading ? (
            <p className="text-[11px] text-zinc-500">Loading activity…</p>
          ) : (
            <BillingActivityList logs={logs} />
          )}
        </section>
      </div>
    </div>
  )
}
