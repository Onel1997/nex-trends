import { EyeIcon, TrendingUpIcon } from '@/components/ui/icons'
import {
  formatEngagement,
  formatViews,
  type ViralTrend,
} from '@/lib/mock-trends'
import { cn } from '@/lib'

const PLATFORM_STYLES = {
  tiktok: {
    label: 'TikTok',
    className: 'bg-zinc-950/80 text-zinc-100 ring-1 ring-white/10',
  },
  instagram: {
    label: 'Instagram',
    className:
      'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white ring-1 ring-white/10',
  },
} as const

type TrendCardProps = {
  trend: ViralTrend
}

export function TrendCard({ trend }: TrendCardProps) {
  const platform = PLATFORM_STYLES[trend.platform]

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70">
      <div
        className={cn(
          'relative aspect-[9/16] w-full bg-gradient-to-br sm:aspect-[4/5]',
          trend.thumbnailFrom,
          trend.thumbnailTo,
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(9,9,11,0.85)_100%)]" />
        <span
          className={cn(
            'absolute left-3 top-3 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm sm:text-[11px]',
            platform.className,
          )}
        >
          {platform.label}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white drop-shadow-sm">
            {trend.title}
          </p>
          <p className="mt-1 truncate text-xs text-violet-200/90">{trend.hashtag}</p>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center opacity-30"
          aria-hidden
        >
          <div className="size-14 rounded-full border-2 border-dashed border-white/40" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <span className="w-fit rounded-md bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          {trend.niche}
        </span>

        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              <EyeIcon className="size-3.5" aria-hidden />
              Views
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-white">
              {formatViews(trend.views)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              <TrendingUpIcon className="size-3.5" aria-hidden />
              Engagement
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-emerald-400">
              {formatEngagement(trend.engagementRate)}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
