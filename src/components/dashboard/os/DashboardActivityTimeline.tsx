import { useState } from 'react'
import { DashboardSubsectionHeader } from '@/components/dashboard/os/DashboardSubsectionHeader'
import { AiPulseIndicator } from '@/components/ui/AiPulseIndicator'
import {
  BoltIcon,
  BookmarkIcon,
  ChartBarIcon,
  ClapperboardIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDashboardData } from '@/hooks/useDashboardData'
import type { ActivityItem } from '@/types/dashboard'
import { cn } from '@/lib'

const MAX_VISIBLE = 5

type ActivityVisual = {
  Icon: typeof SparklesIcon
  chip: string
}

function getActivityVisual(tool: string, label: string): ActivityVisual {
  const text = `${tool} ${label}`.toLowerCase()

  if (text.includes('video') || text.includes('studio') || text.includes('generat')) {
    return { Icon: ClapperboardIcon, chip: 'Video' }
  }
  if (text.includes('saved') || text.includes('bookmark')) {
    return { Icon: BookmarkIcon, chip: 'Saved' }
  }
  if (text.includes('trend') && !text.includes('saved')) {
    return { Icon: TrendingUpIcon, chip: 'Trend' }
  }
  if (text.includes('hook')) {
    return { Icon: BoltIcon, chip: 'Hook' }
  }
  if (text.includes('analy') || text.includes('landing')) {
    return { Icon: ChartBarIcon, chip: 'Analytics' }
  }
  if (text.includes('seo') || text.includes('title')) {
    return { Icon: MagnifyingGlassIcon, chip: 'SEO' }
  }
  if (text.includes('ad') || text.includes('copy')) {
    return { Icon: SparklesIcon, chip: 'Ad Copy' }
  }

  return { Icon: SparklesIcon, chip: 'AI' }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function ActivityTimelineNode({
  item,
  isLatest,
  isLast,
}: {
  item: ActivityItem
  isLatest: boolean
  isLast: boolean
}) {
  const visual = getActivityVisual(item.tool, item.label)
  const { Icon } = visual

  return (
    <li className="dashboard-os-timeline__item relative flex gap-2.5 pb-2 last:pb-0">
      <div className="dashboard-os-timeline__rail flex w-[0.875rem] shrink-0 flex-col items-center">
        <span
          className={cn(
            'relative z-[1] flex size-[0.4375rem] rounded-full',
            isLatest ? 'bg-emerald-400 ring-2 ring-emerald-500/25' : 'bg-zinc-600',
          )}
        >
        </span>
        {!isLast ? (
          <span className="dashboard-os-timeline__line mt-1.5 w-px flex-1 min-h-[1.75rem]" aria-hidden />
        ) : null}
      </div>

      <article
        className={cn(
          'dashboard-os-activity-card min-w-0 flex-1 rounded-[var(--dash-radius)] border px-2.5 py-2 transition-smooth',
          isLatest
            ? 'border-violet-500/15 bg-violet-500/[0.04]'
            : 'border-zinc-800/45 bg-zinc-950/35',
        )}
      >
        <div className="flex items-start gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-zinc-800/60 bg-zinc-900/80 text-violet-400/85">
            <Icon className="size-3" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[11px] font-semibold text-zinc-100">{item.label}</p>
              <span className="dashboard-os-activity-chip shrink-0">{visual.chip}</span>
              {isLatest ? (
                <span className="dashboard-os-activity-chip dashboard-os-activity-chip--live shrink-0">
                  Live
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-[10px] text-zinc-500">{item.tool}</p>
          </div>

          <time className="shrink-0 pt-px text-[9px] font-medium tabular-nums tracking-wide text-zinc-500">
            {formatRelativeTime(item.timestamp)}
          </time>
        </div>
      </article>
    </li>
  )
}

export function DashboardActivityTimeline() {
  const { activities } = useDashboardData()
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? activities : activities.slice(0, MAX_VISIBLE)
  const hasMore = activities.length > MAX_VISIBLE

  return (
    <section className="dashboard-os-section dashboard-os-section--embedded">
      <DashboardSubsectionHeader
        title="AI Activity Feed"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <AiPulseIndicator label="Live" size="sm" />
            {hasMore ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="text-[10px] font-medium text-zinc-500 transition-smooth hover:text-violet-300"
              >
                {expanded ? 'Less' : 'View all'} →
              </button>
            ) : null}
          </div>
        }
      />

      {activities.length === 0 ? (
        <EmptyState
          size="compact"
          variant="premium"
          title="No activity yet"
          description="Generate a video or save a trend — your feed updates here."
          icon={<SparklesIcon className="size-5 text-violet-400/80" aria-hidden />}
        />
      ) : (
        <div className="dashboard-os-timeline rounded-[var(--dash-radius)] border border-zinc-800/45 bg-zinc-950/25 p-2">
          <ul>
            {visible.map((item, i) => (
              <ActivityTimelineNode
                key={item.id}
                item={item}
                isLatest={i === 0}
                isLast={i === visible.length - 1}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
