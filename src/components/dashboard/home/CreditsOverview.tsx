import { ProgressBar } from '@/components/ui/ProgressBar'
import { CreditIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { formatCreditAmount, getUiCreditSnapshot } from '@/lib/credits/display'

export function CreditsOverview() {
  const { usage, isAdmin, userPlan } = useDashboardData()
  const { planLabel, remaining, limit } = getUiCreditSnapshot(userPlan, usage, isAdmin)
  const used = Math.max(0, limit - remaining)
  const pctUsed = limit > 0 ? Math.round((used / limit) * 100) : 0

  return (
    <div className="dashboard-os-account-card dashboard-os-account-panel dashboard-os-credits-card relative overflow-hidden">
      <div
        className="dashboard-os-credits-card__glow pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      />
      <div className="relative p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
            <CreditIcon className="size-4 text-violet-300" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              AI Credits
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-white">
              {formatCreditAmount(remaining)} / {formatCreditAmount(limit)}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-violet-300/90">
              {planLabel} · {formatCreditAmount(limit)} Credits / Monat
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold tabular-nums text-violet-200">
            {pctUsed}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={remaining}
            max={limit}
            mode="remaining"
            label={`${formatCreditAmount(remaining)} von ${formatCreditAmount(limit)} Credits`}
          />
        </div>
      </div>
    </div>
  )
}
