import { CreditsProgressBar } from '@/components/ui/CreditsProgressBar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCredits } from '@/hooks/useCredits'
import { formatCreditAmount, formatUiCreditBalance, getUiCreditSnapshot } from '@/lib/credits/display'
import { formatUsageResetDate } from '@/lib/usage'
import { cn } from '@/lib'

type MonthlyUsageProgressBarProps = {
  className?: string
  compact?: boolean
  /** Show remaining (default) or used portion */
  mode?: 'remaining' | 'used'
}

export function MonthlyUsageProgressBar({
  className,
  compact = false,
  mode = 'remaining',
}: MonthlyUsageProgressBarProps) {
  const {
    userPlan,
    isAdmin,
    unlimited,
    remaining,
    limit,
    used,
    usageResetDate,
    percentUsed,
    depleted,
    low,
  } = useCredits()

  const creditSnapshot = getUiCreditSnapshot(
    userPlan,
    { remaining, limit, used, unlimited },
    isAdmin,
  )
  const { remaining: displayRemaining, limit: displayLimit } = creditSnapshot

  const safeLimit = displayLimit
  const safeRemaining = displayRemaining
  const usedAmount = Math.max(0, safeLimit - safeRemaining)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="font-semibold uppercase tracking-wider text-zinc-500">
          Monthly usage
        </span>
        <span className="text-zinc-400">
          {unlimited
            ? formatUiCreditBalance(creditSnapshot)
            : mode === 'remaining'
              ? `${formatCreditAmount(safeRemaining)} left`
              : `${formatCreditAmount(usedAmount)} / ${formatCreditAmount(safeLimit)}`}
        </span>
      </div>

      {!unlimited && mode === 'remaining' ? (
        <CreditsProgressBar
          remaining={safeRemaining}
          limit={safeLimit}
          size={compact ? 'sm' : 'md'}
        />
      ) : !unlimited ? (
        <ProgressBar
          value={usedAmount}
          max={safeLimit}
          label={`${percentUsed}% used`}
        />
      ) : null}

      {!compact && (
        <p
          className={cn(
            'text-[10px] leading-relaxed',
            depleted && 'text-fuchsia-300/90',
            low && !depleted && 'text-amber-300/90',
            !depleted && !low && 'text-zinc-500',
          )}
        >
          {unlimited
            ? 'Unlimited Credits — keine Limits.'
            : depleted
            ? 'Monthly credits depleted — upgrade your plan to continue.'
            : low
              ? 'Running low on credits — heavier tools cost more.'
              : usageResetDate
                ? `Resets ${formatUsageResetDate(usageResetDate)}`
                : `${percentUsed}% of monthly allowance used`}
        </p>
      )}
    </div>
  )
}
