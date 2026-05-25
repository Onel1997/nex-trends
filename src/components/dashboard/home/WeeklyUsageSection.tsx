import { UsageLineChart } from '@/components/dashboard/home/UsageLineChart'
import { ChartBarIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'

export function WeeklyUsageSection() {
  const { weeklyUsage } = useDashboardData()

  return (
    <div className="dashboard-os-account-card dashboard-os-card overflow-hidden rounded-2xl border border-zinc-800/55 bg-zinc-900/30">
      <div className="flex items-center gap-2.5 border-b border-zinc-800/50 px-3 py-3 sm:px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-800/50">
          <ChartBarIcon className="size-3.5 text-violet-400" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white">Weekly Usage</h3>
          <p className="dashboard-os-muted text-[11px]">Credit consumption</p>
        </div>
      </div>
      <div className="dashboard-os-analytics-chart px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
        <UsageLineChart data={weeklyUsage} />
      </div>
    </div>
  )
}
