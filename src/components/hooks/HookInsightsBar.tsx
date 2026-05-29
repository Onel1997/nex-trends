import { memo } from 'react'
import { getToneLabel } from '@/lib/hook-display'
import { cn } from '@/lib'
import { CopyIcon, SparklesIcon } from '@/components/ui/icons'

type HookInsightsBarProps = {
  recentCopies: Array<{ text: string; at: string }>
  mostSavedTone: { tone: string; label: string; count: number } | null
  savedCount: number
  className?: string
}

export const HookInsightsBar = memo(function HookInsightsBar({
  recentCopies,
  mostSavedTone,
  savedCount,
  className,
}: HookInsightsBarProps) {
  const hasContent = recentCopies.length > 0 || mostSavedTone != null || savedCount > 0
  if (!hasContent) return null

  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-2 overflow-x-hidden rounded-xl border border-zinc-800/60',
        'bg-gradient-to-r from-zinc-950/80 via-violet-950/20 to-zinc-950/80 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4 sm:px-4',
        className,
      )}
    >
      {recentCopies.length > 0 && (
        <div className="flex min-w-0 items-center gap-2">
          <CopyIcon className="size-3.5 shrink-0 text-emerald-400/70" aria-hidden />
          <p className="truncate text-[11px] text-zinc-500">
            <span className="font-semibold text-zinc-400">Zuletzt kopiert:</span>{' '}
            <span className="text-zinc-300">&ldquo;{recentCopies[0].text}&rdquo;</span>
          </p>
        </div>
      )}

      {mostSavedTone && (
        <div className="flex items-center gap-2 sm:ml-auto">
          <SparklesIcon className="size-3.5 shrink-0 text-violet-400/70" aria-hidden />
          <p className="text-[11px] text-zinc-500">
            <span className="font-semibold text-zinc-400">Beliebtester Ton:</span>{' '}
            <span className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-violet-300/90 ring-1 ring-violet-500/15">
              {mostSavedTone.label || getToneLabel(mostSavedTone.tone)}
            </span>
            <span className="ml-1 tabular-nums text-zinc-600">({mostSavedTone.count}×)</span>
          </p>
        </div>
      )}
    </div>
  )
})
