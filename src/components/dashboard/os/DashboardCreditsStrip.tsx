import { CreditsOverview } from '@/components/dashboard/home/CreditsOverview'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { SubscriptionSection } from '@/components/dashboard/home/SubscriptionSection'
import { WeeklyUsageSection } from '@/components/dashboard/home/WeeklyUsageSection'

export function DashboardCreditsStrip() {
  return (
    <section className="dashboard-os-section dashboard-os-account animate-fade-in animation-delay-500 space-y-4 sm:space-y-5">
      <DashboardSectionHeading
        title="Account & Usage"
        description="Credits, subscription, and weekly creator analytics."
      />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <CreditsOverview />
        <SubscriptionSection />
      </div>
      <WeeklyUsageSection />
    </section>
  )
}
