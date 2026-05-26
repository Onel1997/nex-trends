import { CreditsProgressBar } from '@/components/ui/CreditsProgressBar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCredits } from '@/hooks/useCredits'
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
  const { unlimited, remaining, limit, usageResetDate, percentUsed, depleted, low } =
    useCredits()

  if (unlimited) {
    return (
      <div
        className={cn(
          'rounded-xl border border-violet-500/25 bg-violet-950/40 px-3 py-2.5',
          className,
        )}
      >
        <p className="text-[11px] font-semibold text-violet-200">Unlimited credits</p>
        {!compact && (
          <p className="mt-0.5 text-[10px] text-zinc-500">No monthly cap on this plan</p>
        )}
      </div>
    )
  }

  const safeLimit = limit ?? 25
  const safeRemaining = remaining ?? 0
  const usedAmount = Math.max(0, safeLimit - safeRemaining)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="font-semibold uppercase tracking-wider text-zinc-500">
          Monthly usage
        </span>
        <span className="tabular-nums text-zinc-400">
          {mode === 'remaining'
            ? `${safeRemaining} left`
            : `${usedAmount} / ${safeLimit}`}
        </span>
      </div>

      {mode === 'remaining' ? (
        <CreditsProgressBar
          remaining={safeRemaining}
          limit={safeLimit}
          size={compact ? 'sm' : 'md'}
        />
      ) : (
        <ProgressBar
          value={usedAmount}
          max={safeLimit}
          label={`${percentUsed}% used`}
        />
      )}

      {!compact && (
        <p
          className={cn(
            'text-[10px] leading-relaxed',
            depleted && 'text-fuchsia-300/90',
            low && !depleted && 'text-amber-300/90',
            !depleted && !low && 'text-zinc-500',
          )}
        >
          {depleted
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
