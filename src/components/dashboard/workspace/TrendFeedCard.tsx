'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { BookmarkIcon } from '@/components/ui/icons'
import { scaleIn, useWorkspaceMotion } from '@/components/dashboard/workspace/motion'
import { cn } from '@/lib'
import type { TrendFeedItem, TrendStatusBadge } from '@/types/dashboard-workspace'

const PLATFORM_STYLES: Record<string, string> = {
  TikTok: 'border-zinc-700/80 bg-zinc-900/80 text-zinc-200',
  Instagram: 'border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-200',
  YouTube: 'border-red-500/25 bg-red-500/10 text-red-200',
}

const STATUS_VARIANT: Record<TrendStatusBadge, 'muted' | 'warning' | 'success'> = {
  Early: 'muted',
  Rising: 'warning',
  Exploding: 'success',
}

type TrendFeedCardProps = {
  item: TrendFeedItem
  saved?: boolean
  onToggleSave?: () => void
}

export function TrendFeedCard({ item, saved, onToggleSave }: TrendFeedCardProps) {
  const { reduced, transition } = useWorkspaceMotion()

  return (
    <motion.article
      variants={scaleIn}
      transition={transition}
      className="dashboard-ws-trend-card group relative flex w-[min(82vw,17.5rem)] shrink-0 flex-col rounded-xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 p-4 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.65)] transition-colors hover:border-violet-500/25 sm:w-[17.5rem]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            PLATFORM_STYLES[item.platform] ?? PLATFORM_STYLES.TikTok,
          )}
        >
          {item.platform}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant={STATUS_VARIANT[item.status]} className="text-[9px]">
            {item.status}
          </Badge>
          {onToggleSave ? (
            <button
              type="button"
              onClick={onToggleSave}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg border transition-all',
                saved
                  ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                  : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-500 hover:border-violet-500/30 hover:text-violet-300',
              )}
              aria-label={saved ? 'Trend entfernen' : 'Trend speichern'}
            >
              <BookmarkIcon className={cn('size-4', saved && 'fill-current')} />
            </button>
          ) : null}
        </div>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-zinc-100">
        {item.title}
      </h3>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-violet-400/90">
        {item.niche}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-2 py-2 text-center">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Viral</dt>
          <dd className="mt-0.5 text-sm font-bold tabular-nums text-white">{item.viralScore}</dd>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-2 py-2 text-center">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Growth</dt>
          <dd className="mt-0.5 text-sm font-bold tabular-nums text-emerald-400">+{item.growthPercent}%</dd>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/60 px-2 py-2 text-center">
          <dt className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Velocity</dt>
          <dd className="mt-0.5 text-[10px] font-semibold leading-tight text-zinc-300">
            {item.engagementVelocity}
          </dd>
        </div>
      </dl>

      {!reduced ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          layoutId={undefined}
        />
      ) : null}
    </motion.article>
  )
}
