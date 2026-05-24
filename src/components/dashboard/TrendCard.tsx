import { cn } from '@/lib'

export type DisplayTrend = {
  id: string
  title: string
  platform: string
  views: string
  engagement: string
  description: string
  gradientFrom: string
  gradientTo: string
}

type TrendCardProps = {
  trend: DisplayTrend
}

export function TrendCard({ trend }: TrendCardProps) {
  const isTikTok = trend.platform.toLowerCase().includes('tiktok')

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-violet-900/10">
      <div
        className={cn(
          'relative flex aspect-video w-full flex-col justify-end bg-gradient-to-br p-4',
          trend.gradientFrom,
          trend.gradientTo,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />
        <span
          className={cn(
            'relative mb-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
            isTikTok
              ? 'bg-black/40 text-white ring-1 ring-white/20'
              : 'bg-white/20 text-white ring-1 ring-white/30',
          )}
        >
          {trend.platform}
        </span>
        <p className="relative text-xs font-medium text-white/80">
          {trend.views} Aufrufe
        </p>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug text-white">
          {trend.title}
        </h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400">
          {trend.description}
        </p>
        <p className="mt-3 text-xs font-medium text-violet-400">
          Engagement: {trend.engagement}
        </p>
      </div>
    </article>
  )
}
