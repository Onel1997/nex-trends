import { memo } from 'react'
import { cn } from '@/lib'
import type { SeoTitleRecentCopy } from '@/lib/seo-title-analytics'

type SeoTitleInsightsBarProps = {
  recentCopies: SeoTitleRecentCopy[]
  mostSavedIntent: string | null
  savedCount: number
  className?: string
}

export const SeoTitleInsightsBar = memo(function SeoTitleInsightsBar({
  recentCopies,
  mostSavedIntent,
  savedCount,
  className,
}: SeoTitleInsightsBarProps) {
  if (recentCopies.length === 0 && savedCount === 0) return null

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/50 px-3 py-2.5',
        className,
      )}
    >
      {savedCount > 0 && (
        <span className="hook-badge hook-badge--tone tabular-nums">
          {savedCount} gespeichert
        </span>
      )}
      {mostSavedIntent && (
        <span className="hook-badge hook-badge--platform">Top Intent: {mostSavedIntent}</span>
      )}
      {recentCopies[0] && (
        <span className="truncate text-[11px] text-zinc-500">
          Zuletzt kopiert: <span className="text-zinc-400">{recentCopies[0].text}</span>
        </span>
      )}
    </div>
  )
})

SeoTitleInsightsBar.displayName = 'SeoTitleInsightsBar'
