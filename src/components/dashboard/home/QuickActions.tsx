import { FeatureNavCard } from '@/components/dashboard/home/FeatureNavCard'
import { getQuickActionRoutes } from '@/lib/routes'
import type { DashboardRouteId } from '@/lib/routes'

type QuickActionsProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const routes = getQuickActionRoutes()

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {routes.map((route, index) => (
        <div
          key={route.id}
          className={index === 0 ? 'sm:col-span-2 xl:col-span-1' : undefined}
        >
          <FeatureNavCard
            route={route}
            onNavigate={onNavigate}
            variant={index === 0 ? 'default' : 'compact'}
          />
        </div>
      ))}
    </div>
  )
}
