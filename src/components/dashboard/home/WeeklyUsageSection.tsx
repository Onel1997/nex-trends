import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { UsageLineChart } from '@/components/dashboard/home/UsageLineChart'
import { ChartBarIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'

export function WeeklyUsageSection() {
  const { weeklyUsage } = useDashboardData()

  return (
    <Card variant="glass" className="animate-fade-in glass-premium overflow-hidden">
      <CardHeader className="border-zinc-800/40">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 ring-1 ring-violet-500/15">
            <ChartBarIcon className="size-4 text-violet-400" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white sm:text-base">
              Weekly Usage
            </h3>
            <p className="text-xs text-zinc-500">Creator analytics · credit consumption</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <UsageLineChart data={weeklyUsage} />
      </CardBody>
    </Card>
  )
}
