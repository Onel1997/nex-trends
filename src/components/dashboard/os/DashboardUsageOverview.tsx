import { memo } from 'react'
import { DashboardMetricCard } from '@/components/dashboard/os/DashboardMetricCard'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import {
  BoltIcon,
  BookmarkIcon,
  ChartBarIcon,
  CreditCardIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import type { DashboardUsageOverview as UsageOverviewData } from '@/hooks/useDashboardUsageOverview'

type DashboardUsageOverviewProps = {
  data: UsageOverviewData
}

function DashboardUsageOverviewInner({ data }: DashboardUsageOverviewProps) {
  return (
    <section className="dashboard-os-section dashboard-os-usage-overview">
      <DashboardSectionHeading
        title="Usage Overview"
        description="Lightweight snapshot of your creator activity."
        compact
      />

      <div className="dashboard-os-metrics-grid grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-5">
        <DashboardMetricCard
          label="Hooks generated"
          value={data.hooksGenerated}
          sub="All-time sessions"
          icon={BoltIcon}
          emptyDisplay="—"
          delayMs={0}
        />
        <DashboardMetricCard
          label="Saved hooks"
          value={data.savedHooksCount}
          sub="In your library"
          icon={BookmarkIcon}
          emptyDisplay="—"
          delayMs={40}
        />
        <DashboardMetricCard
          label="Credits used"
          value={data.creditsUsed}
          sub="This billing period"
          icon={CreditCardIcon}
          delayMs={80}
        />
        <DashboardMetricCard
          label="Top tone"
          value={data.mostUsedTone?.label ?? ''}
          sub={
            data.mostUsedTone
              ? `${data.mostUsedTone.count}× used`
              : 'Generate hooks to unlock'
          }
          icon={SparklesIcon}
          emptyDisplay="—"
          delayMs={120}
        />
        <DashboardMetricCard
          label="Top platform"
          value={data.mostUsedPlatform?.label ?? ''}
          sub={
            data.mostUsedPlatform
              ? `${data.mostUsedPlatform.count}× used`
              : 'Save hooks with a platform'
          }
          icon={ChartBarIcon}
          emptyDisplay="—"
          className="col-span-2 lg:col-span-1"
          delayMs={160}
        />
      </div>
    </section>
  )
}

export const DashboardUsageOverview = memo(DashboardUsageOverviewInner)
