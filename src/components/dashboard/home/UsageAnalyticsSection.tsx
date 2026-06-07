import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TrendingUpIcon } from '@/components/ui/icons'
import { UsageBarChart } from '@/components/dashboard/home/UsageBarChart'
import { RecentActivityList } from '@/components/dashboard/home/RecentActivityList'
import { useDashboardData } from '@/hooks/useDashboardData'
import { formatUiCreditBalance, getUiCreditSnapshot } from '@/lib/credits/display'

export function UsageAnalyticsSection() {
  const { usage, weeklyUsage, resetDateLabel, userPlan, isAdmin } = useDashboardData()

  const creditSnapshot = getUiCreditSnapshot(userPlan, usage, isAdmin)
  const { remaining, limit, unlimited } = creditSnapshot
  const used = usage.used

  return (
    <Card className="animate-fade-in animation-delay-100">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
            <TrendingUpIcon className="size-4 text-violet-400" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">Usage Analytics</h3>
            <p className="text-xs text-zinc-500">Credits & Aktivität</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Verfügbar"
            value={formatUiCreditBalance(creditSnapshot)}
          />
          <MetricCard
            label="Genutzt"
            value={`${used} Aktionen`}
          />
          <MetricCard label="Reset" value={resetDateLabel || '—'} />
        </div>

        {!unlimited && (
          <div>
            <div className="mb-2.5 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500">Credits</span>
              <span className="font-semibold tabular-nums text-zinc-300">
                {formatUiCreditBalance(creditSnapshot)} übrig
              </span>
            </div>
            <ProgressBar
              value={remaining}
              max={limit}
              mode="remaining"
              label={`${formatUiCreditBalance(creditSnapshot)} verbleibend`}
            />
          </div>
        )}

        <UsageBarChart data={weeklyUsage} />
        <RecentActivityList />
      </CardBody>
    </Card>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 px-4 py-3.5 transition-smooth hover:border-zinc-700/60">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold tracking-tight text-white">{value}</p>
    </div>
  )
}
