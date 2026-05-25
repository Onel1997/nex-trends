import { FeatureNavCard } from '@/components/dashboard/home/FeatureNavCard'
import { getMarketingToolRoutes } from '@/lib/routes'
import type { DashboardRouteId } from '@/lib/routes'

type AiToolsSectionProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

export function AiToolsSection({ onNavigate }: AiToolsSectionProps) {
  const routes = getMarketingToolRoutes()

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {routes.map((route) => (
        <FeatureNavCard key={route.id} route={route} onNavigate={onNavigate} />
      ))}
    </div>
  )
}
