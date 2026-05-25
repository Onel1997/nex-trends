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
  chipClass: string
}

function getActivityVisual(tool: string, label: string): ActivityVisual {
  const text = `${tool} ${label}`.toLowerCase()

  if (text.includes('video') || text.includes('studio') || text.includes('generat')) {
    return {
      Icon: ClapperboardIcon,
      chip: 'Video',
      chipClass: 'border-violet-500/25 bg-violet-500/10 text-violet-300/90',
    }
  }
  if (text.includes('saved') || text.includes('bookmark')) {
    return {
      Icon: BookmarkIcon,
      chip: 'Saved',
      chipClass: 'border-fuchsia-500/25 bg-fuchsia-500/8 text-fuchsia-300/90',
    }
  }
  if (text.includes('trend') && !text.includes('saved')) {
    return {
      Icon: TrendingUpIcon,
      chip: 'Trend',
      chipClass: 'border-violet-500/25 bg-violet-500/10 text-violet-300/90',
    }
  }
  if (text.includes('hook')) {
    return {
      Icon: BoltIcon,
      chip: 'Hook',
      chipClass: 'border-amber-500/25 bg-amber-500/10 text-amber-300/90',
    }
  }
  if (text.includes('analy') || text.includes('landing')) {
    return {
      Icon: ChartBarIcon,
      chip: 'Analytics',
      chipClass: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-300/90',
    }
  }
  if (text.includes('seo') || text.includes('title')) {
    return {
      Icon: MagnifyingGlassIcon,
      chip: 'SEO',
      chipClass: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300/90',
    }
  }
  if (text.includes('ad') || text.includes('copy')) {
    return {
      Icon: SparklesIcon,
      chip: 'Ad Copy',
      chipClass: 'border-violet-500/25 bg-violet-500/10 text-violet-300/90',
    }
  }

  return {
    Icon: SparklesIcon,
    chip: 'AI',
    chipClass: 'border-zinc-700/60 bg-zinc-800/50 text-zinc-400',
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function ActivityRow({
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
    <li
      className={cn(
        'dashboard-os-activity-stream__row group relative flex items-center gap-2.5 py-2',
        !isLast && 'border-b border-zinc-800/45',
        isLatest && 'dashboard-os-activity-stream__row--live',
      )}
    >
      {isLatest ? (
        <span
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-emerald-500/70"
          aria-hidden
        />
      ) : null}

      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-violet-400/90">
        <Icon className="size-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1 pl-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-zinc-100">{item.label}</p>
          <span
            className={cn(
              'shrink-0 rounded px-1.5 py-px text-[8px] font-bold uppercase tracking-wide',
              visual.chipClass,
            )}
          >
            {visual.chip}
          </span>
          {isLatest ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[8px] font-semibold uppercase text-emerald-400">
              <span className="size-1 rounded-full bg-emerald-400" aria-hidden />
              Live
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[10px] text-zinc-500">{item.tool}</p>
      </div>

      <time className="shrink-0 text-[10px] font-medium tabular-nums text-zinc-500">
        {formatRelativeTime(item.timestamp)}
      </time>

      <span
        className="shrink-0 text-sm text-zinc-600 transition-smooth group-hover:text-zinc-400"
        aria-hidden
      >
        ›
      </span>
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
                className="text-[11px] font-medium text-zinc-500 transition-smooth hover:text-violet-300"
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
        <div className="dashboard-os-activity-stream rounded-xl border border-zinc-800/60 bg-zinc-900/35 px-2 backdrop-blur-sm">
          <ul>
            {visible.map((item, i) => (
              <ActivityRow
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
