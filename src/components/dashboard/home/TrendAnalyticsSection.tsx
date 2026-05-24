import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EyeIcon } from '@/components/ui/icons'
import { useDashboardData } from '@/hooks/useDashboardData'
import { cn } from '@/lib'

const STAGGER_DELAYS = [
  'animation-delay-75',
  'animation-delay-150',
  'animation-delay-200',
  'animation-delay-300',
] as const

export function TrendAnalyticsSection() {
  const { trendInsights } = useDashboardData()

  return (
    <Card className="animate-fade-in animation-delay-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/20">
            <EyeIcon className="size-4 text-fuchsia-400" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white">Trend Analytics</h3>
            <p className="text-xs text-zinc-500">Virale Insights für TikTok & Instagram</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trendInsights.map((trend, index) => (
            <TrendInsightCard
              key={trend.id}
              trend={trend}
              delayClass={STAGGER_DELAYS[index] ?? 'animation-delay-75'}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

function TrendInsightCard({
  trend,
  delayClass,
}: {
  trend: {
    id: string
    title: string
    platform: string
    views: string
    change: string
    gradientFrom: string
    gradientTo: string
  }
  delayClass: string
}) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/50 transition-smooth',
        'hover:-translate-y-0.5 hover:border-zinc-700/70 hover:shadow-lg hover:shadow-violet-950/10',
        delayClass,
        'animate-fade-in',
      )}
    >
      <div
        className={cn(
          'relative flex h-20 items-end bg-gradient-to-br p-3',
          trend.gradientFrom,
          trend.gradientTo,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity group-hover:from-black/60" />
        <span className="relative rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          {trend.platform}
        </span>
      </div>
      <div className="p-4">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white">
          {trend.title}
        </h4>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-zinc-500">{trend.views} Views</span>
          <span className="font-semibold text-emerald-400">{trend.change}</span>
        </div>
      </div>
    </article>
  )
}
