import { DashboardSkeleton } from '@/components/ui/Skeleton'
import {
  DashboardActivityTimeline,
  DashboardCoreProducts,
  DashboardCreditsStrip,
  DashboardHero,
  DashboardLibrarySection,
  DashboardQuickActions,
} from '@/components/dashboard/os'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import type { DashboardToolId } from '@/lib'

type DashboardPageProps = {
  onNavigate: (tool: DashboardToolId) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { isLoading, error, user, weeklyUsage } = useDashboardData()
  const { stats, videos, loadingVideos } = useDashboardStats(weeklyUsage)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dashboard-os nex-ambient relative mx-auto max-w-6xl">
      {/* Decorative layer — outside flex gap so it never adds vertical spacing */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="nex-ambient__orb nex-ambient__orb--1" />
        <div className="nex-ambient__orb nex-ambient__orb--2" />
      </div>

      <div className="dashboard-os__content relative flex flex-col gap-7 sm:gap-9">
        {error && (
          <div
            role="alert"
            className="animate-fade-in rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <DashboardHero user={user} stats={stats} />

        <DashboardQuickActions onNavigate={onNavigate} />

        <DashboardCoreProducts onNavigate={onNavigate} />

        <DashboardLibrarySection
          videos={videos}
          videosLoading={loadingVideos}
          onNavigate={onNavigate}
        />

        <DashboardActivityTimeline />

        <DashboardCreditsStrip />
      </div>
    </div>
  )
}
