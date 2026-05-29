import { memo } from 'react'
import { getAdCopyToneLabel } from '@/lib/ad-copy-display'
import { cn } from '@/lib'
import { CopyIcon, SparklesIcon } from '@/components/ui/icons'

type AdCopyInsightsBarProps = {
  recentCopies: Array<{ text: string; at: string }>
  mostSavedTone: { tone: string; label: string; count: number } | null
  savedCount: number
  className?: string
}

export const AdCopyInsightsBar = memo(function AdCopyInsightsBar({
  recentCopies,
  mostSavedTone,
  savedCount,
  className,
}: AdCopyInsightsBarProps) {
  const hasContent = recentCopies.length > 0 || mostSavedTone != null || savedCount > 0
  if (!hasContent) return null

  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-2 overflow-x-hidden px-0.5 sm:mb-5 sm:flex-row sm:items-center sm:gap-4',
        className,
      )}
    >
      {recentCopies.length > 0 && (
        <div className="flex min-w-0 items-center gap-2">
          <CopyIcon className="size-3.5 shrink-0 text-emerald-400/65" aria-hidden />
          <p className="truncate text-[11px] text-zinc-600">
            <span className="font-medium text-zinc-500">Zuletzt kopiert:</span>{' '}
            <span className="text-zinc-400">&ldquo;{recentCopies[0].text}&rdquo;</span>
          </p>
        </div>
      )}

      {mostSavedTone && (
        <div className="flex items-center gap-2 sm:ml-auto">
          <SparklesIcon className="size-3.5 shrink-0 text-violet-400/65" aria-hidden />
          <p className="text-[11px] text-zinc-600">
            <span className="font-medium text-zinc-500">Beliebtester Ton:</span>{' '}
            <span className="text-violet-300/85">
              {mostSavedTone.label || getAdCopyToneLabel(mostSavedTone.tone)}
            </span>
            <span className="ml-1 tabular-nums text-zinc-700">({mostSavedTone.count}×)</span>
          </p>
        </div>
      )}
    </div>
  )
})
