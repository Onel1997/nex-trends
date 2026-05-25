import { CreditsOverview } from '@/components/dashboard/home/CreditsOverview'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { SubscriptionSection } from '@/components/dashboard/home/SubscriptionSection'
import { WeeklyUsageSection } from '@/components/dashboard/home/WeeklyUsageSection'

export function DashboardCreditsStrip() {
  return (
    <section className="animate-fade-in animation-delay-500 space-y-5 sm:space-y-6">
      <DashboardSectionHeading
        title="Account & Usage"
        description="Credits, subscription, and your weekly creator analytics."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <CreditsOverview />
        <SubscriptionSection />
      </div>
      <WeeklyUsageSection />
    </section>
  )
}
