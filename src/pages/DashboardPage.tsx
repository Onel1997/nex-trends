import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { AiToolsSection } from '@/components/dashboard/home/AiToolsSection'
import { CreditsOverview } from '@/components/dashboard/home/CreditsOverview'
import { DashboardSection } from '@/components/dashboard/home/DashboardSection'
import { QuickActions } from '@/components/dashboard/home/QuickActions'
import { RecentActivityList } from '@/components/dashboard/home/RecentActivityList'
import { SavedTrendsPreview } from '@/components/dashboard/home/SavedTrendsPreview'
import { SubscriptionSection } from '@/components/dashboard/home/SubscriptionSection'
import { TrendIntelligenceFeaturedCard } from '@/components/dashboard/home/TrendIntelligenceFeaturedCard'
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
    <div className="dashboard-page mx-auto max-w-5xl">
      <header className="animate-fade-in pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Overview</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {user ? `Hallo, ${user.name.split(' ')[0]}` : 'Willkommen'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Dein Command Center — Credits, Trends & AI Tools.
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
        className="mt-6 sm:mt-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CreditsOverview />
          <SubscriptionSection />
        </div>
        <div className="mt-4">
          <WeeklyUsageSection />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Trend Intelligence"
        description="Starte hier — dein viraler Trend-Feed und AI Research Studio."
      >
        <TrendIntelligenceFeaturedCard
          onNavigate={() => onNavigate('trend-intelligence')}
        />
        <div className="mt-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Quick Actions
          </p>
          <QuickActions onNavigate={onNavigate} />
        </div>
      </DashboardSection>

      <DashboardSection
        title="AI Marketing Tools"
        description="Hooks, Ad Copy, SEO & Landing Page Audits — gleiche Reihenfolge wie in der Navigation."
      >
        <AiToolsSection onNavigate={onNavigate} />
      </DashboardSection>

      <DashboardSection title="Saved Trends" description="Zuletzt gespeicherte virale Insights.">
        <SavedTrendsPreview onNavigate={onNavigate} />
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Deine letzten KI-Aktionen im Überblick."
        showDivider
      >
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-4 sm:p-5">
          <RecentActivityList />
        </div>
      </DashboardSection>
    </div>
  )
}
