import { ProgressBar } from '@/components/ui/ProgressBar'
import { CreditIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { MAX_FREE_CREDITS } from '@/lib/constants'

export function CreditsOverview() {
  const { usage, hasProAccess, remainingLabel, resetDateLabel } = useDashboardData()
  const limit = usage.limit ?? MAX_FREE_CREDITS
  const remaining = usage.remaining ?? 0

  return (
    <div className="dashboard-os-account-card dashboard-os-card glass-premium animate-fade-in rounded-2xl border border-zinc-800/55 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-violet-900/40 shadow-[0_0_24px_-8px_rgba(139,92,246,0.45)] ring-1 ring-violet-500/25">
          <CreditIcon className="size-5 text-violet-300" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Credits
          </p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-white">{remainingLabel}</p>
          {resetDateLabel && !hasProAccess && (
            <p className="dashboard-os-muted mt-1 text-xs">Resets {resetDateLabel}</p>
          )}
        </div>
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
  )
}
