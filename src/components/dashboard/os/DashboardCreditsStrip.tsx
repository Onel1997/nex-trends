import { CreditsOverview } from '@/components/dashboard/home/CreditsOverview'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { SubscriptionSection } from '@/components/dashboard/home/SubscriptionSection'
import { WeeklyUsageSection } from '@/components/dashboard/home/WeeklyUsageSection'

export function DashboardCreditsStrip() {
  return (
    <section className="dashboard-os-section dashboard-os-account space-y-3">
      <DashboardSectionHeading
        title="Account & Usage"
        description="Credits, subscription, and weekly analytics."
        compact
      />
      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <CreditsOverview />
        <SubscriptionSection />
      </div>
      <WeeklyUsageSection />
    </section>
  )
}
