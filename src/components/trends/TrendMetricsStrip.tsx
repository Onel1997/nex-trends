import { EngagementBar } from '@/components/trends/EngagementBar'
import { GrowthIndicatorBadge } from '@/components/trends/GrowthIndicatorBadge'
import { HeatLevelBadge } from '@/components/trends/HeatLevelBadge'
import { ViralScoreRing } from '@/components/trends/ViralScoreRing'
import {
  deriveEngagementScore,
  deriveGrowthIndicator,
  deriveHeatLevel,
} from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

type TrendMetricsStripProps = {
  trend: TrendIntelligence
  variant?: 'card' | 'modal'
}

export function TrendMetricsStrip({ trend, variant = 'card' }: TrendMetricsStripProps) {
  const engagementScore = deriveEngagementScore(trend)
  const heat = deriveHeatLevel(trend)
  const growth = deriveGrowthIndicator(trend)

  if (variant === 'card') {
    return (
      <div className="flex items-center gap-2">
        <HeatLevelBadge level={heat} compact />
        <GrowthIndicatorBadge indicator={growth} compact />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ViralScoreRing score={trend.viralScore} size="lg" showLabel animate />
        <div className="min-w-0 flex-1 space-y-2">
          <EngagementBar score={engagementScore} />
          <div className="flex flex-wrap gap-2">
            <HeatLevelBadge level={heat} />
            <GrowthIndicatorBadge indicator={growth} />
          </div>
        </div>
      </div>
    </div>
  )
}
