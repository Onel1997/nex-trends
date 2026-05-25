import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ChartBarIcon } from '@/components/ui/icons'
import { UsageBarChart } from '@/components/dashboard/home/UsageBarChart'
import { useDashboardData } from '@/hooks/useDashboardData'

export function WeeklyUsageSection() {
  const { weeklyUsage } = useDashboardData()

  return (
    <Card className="animate-fade-in animation-delay-100">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
            <ChartBarIcon className="size-4 text-violet-400" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">Weekly Usage</h3>
            <p className="text-xs text-zinc-500">Credits diese Woche</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <UsageBarChart data={weeklyUsage} />
      </CardBody>
    </Card>
  )
}
