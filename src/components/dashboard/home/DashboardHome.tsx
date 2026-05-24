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
    <div className="space-y-8 lg:space-y-10">
      <header className="animate-fade-in">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Willkommen zurück
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Dein {APP_NAME} Command Center — Analytics, Abo & Trend-Scouting an
          einem Ort.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="animate-fade-in rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3.5 text-sm text-red-300"
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
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Trend Intelligence
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            Viral Score, Hashtags, Velocity & Content Ideas für TikTok & Instagram.
          </p>
        </div>
        <TrendScoutingPanel />
      </section>
    </div>
  )
}
