import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { UserOverviewCard } from '@/components/dashboard/home/UserOverviewCard'
import { UsageAnalyticsSection } from '@/components/dashboard/home/UsageAnalyticsSection'
import { SubscriptionSection } from '@/components/dashboard/home/SubscriptionSection'
import { TrendAnalyticsSection } from '@/components/dashboard/home/TrendAnalyticsSection'
import { TrendScoutingPanel } from '@/components/dashboard/TrendScoutingPanel'
import { useDashboardData } from '@/hooks/useDashboardData'
import { APP_NAME } from '@/lib/constants'

export function DashboardHome() {
  const { isLoading, error } = useDashboardData()

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="animate-fade-in">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Willkommen zurück
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Dein {APP_NAME} Command Center — Analytics, Abo & Trend-Scouting an
          einem Ort.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <UserOverviewCard />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <UsageAnalyticsSection />
            </div>
            <SubscriptionSection />
          </div>

          <TrendAnalyticsSection />
        </>
      )}

      <section className="animate-fade-in animation-delay-300">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Trend-Scouting</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Entdecke virale Nischen mit KI — direkt aus dem Dashboard.
          </p>
        </div>
        <TrendScoutingPanel />
      </section>
    </div>
  )
}
