import { CreditIcon } from '@/components/ui/icons'
import { PlanBadge } from '@/components/billing/PlanBadge'
import { useCredits } from '@/hooks/useCredits'
import {
  formatUiCreditAllowance,
  formatUiCreditBalance,
  getUiCreditSnapshot,
} from '@/lib/credits/display'
import { formatUsageResetDate } from '@/lib/usage'
import { cn } from '@/lib'

type CreditsUsageCardProps = {
  className?: string
  onUpgrade?: () => void
}

export function CreditsUsageCard({ className, onUpgrade }: CreditsUsageCardProps) {
  const {
    userPlan,
    used,
    usageResetDate,
    percentUsed,
    openUpgradeModal,
    isAdmin,
    unlimited,
    remaining,
    limit,
  } = useCredits()

  const creditSnapshot = getUiCreditSnapshot(
    userPlan,
    { remaining, limit, used, unlimited },
    isAdmin,
  )
  const { planLabel, remaining: displayRemaining, unlimited: isUnlimited } = creditSnapshot

  const handleUpgrade = onUpgrade ?? openUpgradeModal

  return (
    <section
      className={cn(
        'dashboard-os-card relative overflow-hidden rounded-[var(--dash-radius-lg)]',
        'border border-zinc-800/50 bg-zinc-950/60 p-4',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-600/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Credit balance
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PlanBadge plan={userPlan} />
            {isAdmin && (
              <span className="text-[10px] font-medium text-amber-300/90">Admin</span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {planLabel} · {formatUiCreditAllowance(userPlan, isAdmin)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
          <CreditIcon className="size-5 text-violet-400" aria-hidden />
          <div>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Available</p>
            <p className="text-lg font-bold text-white">
              {formatUiCreditBalance(creditSnapshot)}
            </p>
          </div>
        </div>
      </div>

      <p className="relative mt-3 text-[10px] text-zinc-500">
        <span className="text-zinc-400">{used}</span> credits used this period
        {usageResetDate && (
          <> · Resets {formatUsageResetDate(usageResetDate)}</>
        )}
        {!usageResetDate && <> · {percentUsed}% of monthly allowance</>}
      </p>

      {!isUnlimited && displayRemaining <= 0 && (
        <button
          type="button"
          onClick={() => void handleUpgrade()}
          className="nex-btn nex-btn--primary relative mt-3 w-full min-h-[2.375rem] rounded-[10px] px-3 py-2 text-[11px] font-semibold"
        >
          Upgrade for more credits
        </button>
      )}
    </section>
  )
}
