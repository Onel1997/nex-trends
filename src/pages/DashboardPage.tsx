import { useCallback, useEffect, useState } from 'react'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import {
  DashboardActivityTimeline,
  DashboardCoreProducts,
  DashboardCreditsStrip,
  DashboardHero,
  DashboardLazySection,
  DashboardLibrarySection,
  DashboardQuickActions,
  DashboardUsageOverview,
} from '@/components/dashboard/os'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useDashboardUsageOverview } from '@/hooks/useDashboardUsageOverview'
import { useSavedHooks } from '@/hooks/useSavedHooks'
import { getMergedDashboardActivity } from '@/lib/dashboard-activity'
import type { DashboardToolId } from '@/lib'
import type { ActivityItem } from '@/types/dashboard'

type DashboardPageProps = {
  onNavigate: (tool: DashboardToolId) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { isLoading, error, user, weeklyUsage, usage } = useDashboardData()
  const { stats, videos, loadingVideos } = useDashboardStats(weeklyUsage)
  const { savedHooks } = useSavedHooks()
  const usageOverview = useDashboardUsageOverview(savedHooks, usage)

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(() =>
    getMergedDashboardActivity(),
  )

  const refreshActivity = useCallback(() => {
    setActivityFeed(getMergedDashboardActivity())
  }, [])

  useEffect(() => {
    if (!isLoading) refreshActivity()
  }, [isLoading, usage.used, savedHooks.length, refreshActivity])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshActivity()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshActivity])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dashboard-os nex-os-polish nex-ambient dashboard-os--safe-pad relative mx-auto w-full min-w-0 max-w-6xl overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="nex-ambient__orb nex-ambient__orb--1" />
        <div className="nex-ambient__orb nex-ambient__orb--2" />
      </div>

      <div className="dashboard-os__content relative flex flex-col">
        {error && (
          <div
            role="alert"
            className="animate-fade-in rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <DashboardHero user={user} stats={stats} />

        <DashboardQuickActions onNavigate={onNavigate} />

        <DashboardUsageOverview data={usageOverview} />

        <DashboardCoreProducts onNavigate={onNavigate} />

        <DashboardLazySection minHeight="14rem" className="dashboard-os-workspace-wrap">
          <div className="dashboard-os-workspace">
            <DashboardLibrarySection
              videos={videos}
              videosLoading={loadingVideos}
              onNavigate={onNavigate}
            />
            <DashboardActivityTimeline
              activities={activityFeed}
              onNavigate={onNavigate}
            />
          </div>
        </DashboardLazySection>

        <DashboardLazySection minHeight="10rem">
          <DashboardCreditsStrip />
        </DashboardLazySection>
      </div>
    </div>
  )
}
