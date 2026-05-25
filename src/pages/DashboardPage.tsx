import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { AiToolsSection } from '@/components/dashboard/home/AiToolsSection'
import { CreditsOverview } from '@/components/dashboard/home/CreditsOverview'
import { DashboardSection } from '@/components/dashboard/home/DashboardSection'
import { RecentActivityList } from '@/components/dashboard/home/RecentActivityList'
import { SubscriptionSection } from '@/components/dashboard/home/SubscriptionSection'
import { WeeklyUsageSection } from '@/components/dashboard/home/WeeklyUsageSection'
import { useDashboardData } from '@/hooks/useDashboardData'
import type { DashboardToolId } from '@/lib'

type DashboardPageProps = {
  onNavigate: (tool: DashboardToolId) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { isLoading, error, user } = useDashboardData()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dashboard-page mx-auto max-w-6xl">
      <header className="animate-fade-in pb-1 sm:pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Overview</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {user ? `Hallo, ${user.name.split(' ')[0]}` : 'Willkommen'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Credits, virale Trends und KI-Marketing-Tools — alles an einem Ort.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <DashboardSection
        title="Credits & Usage"
        description="Verfügbare Credits, Abo-Status und wöchentliche Nutzung."
        showDivider={false}
        className="mt-8 sm:mt-10"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CreditsOverview />
          <SubscriptionSection />
        </div>
        <div className="mt-4">
          <WeeklyUsageSection />
        </div>
      </DashboardSection>

      <DashboardSection
        title="AI Marketing Tools"
        description="Trend Intelligence, Content-Tools und deine gespeicherte Trend-Bibliothek."
        className="dashboard-section--spacious"
      >
        <AiToolsSection onNavigate={onNavigate} />
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Deine letzten KI-Aktionen im Überblick."
        showDivider
        className="dashboard-section--spacious"
      >
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-4 sm:p-5">
          <RecentActivityList />
        </div>
      </DashboardSection>
    </div>
  )
}
