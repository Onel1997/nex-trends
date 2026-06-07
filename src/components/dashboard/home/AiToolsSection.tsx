import { FeatureNavCard } from '@/components/dashboard/home/FeatureNavCard'
import { AiStudioFeaturedCard } from '@/components/dashboard/home/AiStudioFeaturedCard'
import { SavedTrendsPreview } from '@/components/dashboard/home/SavedTrendsPreview'
import { TrendIntelligenceFeaturedCard } from '@/components/dashboard/home/TrendIntelligenceFeaturedCard'
import { getMarketingToolRoutes } from '@/lib/routes'
import type { DashboardRouteId } from '@/lib/routes'

type AiToolsSectionProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

export function AiToolsSection({ onNavigate }: AiToolsSectionProps) {
  const routes = getMarketingToolRoutes()

  return (
    <div className="space-y-4 sm:space-y-5">
      <TrendIntelligenceFeaturedCard
        onNavigate={() => onNavigate('trend-intelligence')}
      />

      <AiStudioFeaturedCard onNavigate={() => onNavigate('ai-studio')} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <FeatureNavCard key={route.id} route={route} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="border-t border-zinc-800/40 pt-6 sm:pt-8">
        <SavedTrendsPreview onNavigate={onNavigate} />
      </div>
    </div>
  )
}
