import { DashboardSkeleton } from '@/components/ui/Skeleton'
import {
  DashboardActivityTimeline,
  DashboardCoreProducts,
  DashboardCreditsStrip,
  DashboardHero,
  DashboardLibrarySection,
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
    <div className="dashboard-os nex-ambient relative mx-auto w-full min-w-0 max-w-6xl">
      {/* Decorative layer — outside flex gap so it never adds vertical spacing */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="nex-ambient__orb nex-ambient__orb--1" />
        <div className="nex-ambient__orb nex-ambient__orb--2" />
      </div>

      <div className="dashboard-os__content relative flex flex-col gap-3 sm:gap-4">
        {error && (
          <div
            role="alert"
            className="animate-fade-in rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <DashboardHero user={user} stats={stats} />

        <div className="dashboard-os-workspace">
          <DashboardCoreProducts onNavigate={onNavigate} />

          <DashboardLibrarySection
            videos={videos}
            videosLoading={loadingVideos}
            onNavigate={onNavigate}
          />

          <DashboardActivityTimeline />
        </div>

        <DashboardCreditsStrip />
      </div>
    </div>
  )
}
