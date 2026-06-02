import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { OnboardingTip } from '@/components/onboarding/OnboardingTip'
import { DashboardWorkspace } from '@/components/dashboard/workspace'
import {
  DashboardCreditsStrip,
  DashboardHero,
  DashboardLazySection,
  DashboardQuickActions,
} from '@/components/dashboard/os'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import type { DashboardToolId } from '@/lib'

type DashboardPageProps = {
  onNavigate: (tool: DashboardToolId) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { isLoading, error, user, weeklyUsage, savedTrends, refresh } = useDashboardData()
  const { stats } = useDashboardStats(weeklyUsage, savedTrends)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="dashboard-os nex-os-polish nex-ambient dashboard-os--safe-pad relative mx-auto w-full min-w-0 max-w-6xl">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="nex-ambient__orb nex-ambient__orb--1" />
        <div className="nex-ambient__orb nex-ambient__orb--2" />
      </div>

      <div className="dashboard-os__content dashboard-os-interactive relative flex flex-col">
        {error && <ErrorBanner error={error} onRetry={() => void refresh()} />}

        <OnboardingTip
          tipId="dashboard-credits"
          title="Credits im Blick behalten"
          message="Dein monatliches Kontingent erneuert sich automatisch. Pro-Nutzer haben unbegrenzte Generierungen."
          action={{ label: 'Credits ansehen', onClick: () => onNavigate('billing') }}
          className="mb-1"
        />

        <DashboardHero user={user} stats={stats} />

        <DashboardQuickActions onNavigate={onNavigate} />

        <DashboardWorkspace onNavigate={onNavigate} />

        <DashboardLazySection minHeight="10rem">
          <DashboardCreditsStrip />
        </DashboardLazySection>
      </div>
    </div>
  )
}
