import { UsageLineChart } from '@/components/dashboard/home/UsageLineChart'
import { ChartBarIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'

export function WeeklyUsageSection() {
  const { weeklyUsage } = useDashboardData()

  return (
    <div className="dashboard-os-account-card dashboard-os-card glass-premium animate-fade-in overflow-hidden rounded-2xl border border-zinc-800/55">
      <div className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 ring-1 ring-violet-500/15">
          <ChartBarIcon className="size-4 text-violet-400" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-white">Weekly Usage</h3>
          <p className="dashboard-os-muted text-xs">Creator analytics · credit consumption</p>
        </div>
      </div>
      <div className="px-3 pb-4 pt-2 sm:px-5 sm:pb-5">
        <UsageLineChart data={weeklyUsage} />
      </div>
    </div>
  )
}
