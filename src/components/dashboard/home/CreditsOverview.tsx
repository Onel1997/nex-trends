import { ProgressBar } from '@/components/ui/ProgressBar'
import { CreditIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { MAX_FREE_CREDITS } from '@/lib/constants'

export function CreditsOverview() {
  const { usage, hasProAccess, remainingLabel, resetDateLabel } = useDashboardData()
  const limit = usage.limit ?? MAX_FREE_CREDITS
  const remaining = usage.remaining ?? 0
  const used = Math.max(0, limit - remaining)
  const pctUsed = limit > 0 ? Math.round((used / limit) * 100) : 0

  return (
    <div className="dashboard-os-account-card dashboard-os-card relative overflow-hidden rounded-2xl border border-zinc-800/55 bg-zinc-900/30">
      <div className="relative p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-800/50">
            <CreditIcon className="size-5 text-violet-200" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              AI Credits
            </p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-white">
              {remainingLabel}
            </p>
            {resetDateLabel && !hasProAccess && (
              <p className="dashboard-os-muted mt-1 text-xs">Resets {resetDateLabel}</p>
            )}
            {hasProAccess && (
              <p className="mt-1 text-xs font-medium text-violet-300/90">Unlimited · Pro</p>
            )}
          </div>
          {!hasProAccess && (
            <span className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-violet-200">
              {pctUsed}% used
            </span>
          )}
        </div>
        {!hasProAccess && (
          <div className="mt-4">
            <ProgressBar
              value={remaining}
              max={limit}
              mode="remaining"
              label={`${remaining} von ${limit} Credits`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
