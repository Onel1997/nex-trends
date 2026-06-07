import { UsageLineChart } from '@/components/dashboard/home/UsageLineChart'
import { ChartBarIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'

export function WeeklyUsageSection() {
  const { weeklyUsage } = useDashboardData()

  return (
    <div className="dashboard-os-account-card dashboard-os-account-panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-800/45 px-2.5 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/8">
          <ChartBarIcon className="size-3.5 text-violet-400" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-white">Analytics</h3>
          <p className="dashboard-os-muted text-[10px]">Weekly credit consumption</p>
        </div>
      </div>
      <div className="dashboard-os-analytics-chart px-2.5 pb-2.5 pt-1.5">
        <UsageLineChart data={weeklyUsage} />
      </div>
    </div>
  )
}
