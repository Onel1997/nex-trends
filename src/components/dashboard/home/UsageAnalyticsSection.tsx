import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TrendingUpIcon } from '@/components/ui/icons'
import { UsageBarChart } from '@/components/dashboard/home/UsageBarChart'
import { RecentActivityList } from '@/components/dashboard/home/RecentActivityList'
import { useDashboardData } from '@/hooks/useDashboardData'
import { FREE_MONTHLY_AI_LIMIT } from '@/lib/constants'

export function UsageAnalyticsSection() {
  const { usage, hasProAccess, weeklyUsage, resetDateLabel } = useDashboardData()

  const limit = usage.limit ?? FREE_MONTHLY_AI_LIMIT
  const used = usage.used
  const remaining = usage.remaining ?? 0

  return (
    <Card className="animate-fade-in animation-delay-100">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="size-5 text-violet-400" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Usage Analytics</h3>
            <p className="text-xs text-zinc-500">Credits & Aktivität</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Credits genutzt"
            value={hasProAccess ? `${used} (∞)` : `${used} / ${limit}`}
          />
          <MetricCard
            label="Verbleibend"
            value={hasProAccess ? 'Unbegrenzt' : `${remaining} Credits`}
          />
          <MetricCard label="Reset" value={resetDateLabel || '—'} />
        </div>

        {!hasProAccess && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Credits</span>
              <span className="font-medium text-zinc-300">
                {remaining} / {limit} übrig
              </span>
            </div>
            <ProgressBar
              value={remaining}
              max={limit}
              mode="remaining"
              label={`${remaining} von ${limit} Credits verbleibend`}
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
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}
