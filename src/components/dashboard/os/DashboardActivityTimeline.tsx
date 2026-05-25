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
  iconWrap: string
}

function getActivityVisual(tool: string, label: string): ActivityVisual {
  const text = `${tool} ${label}`.toLowerCase()

  if (text.includes('video') || text.includes('studio') || text.includes('generat')) {
    return {
      Icon: ClapperboardIcon,
      chip: 'AI Video',
      chipClass: 'border-violet-500/35 bg-violet-500/15 text-violet-300',
      iconWrap: 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30 shadow-[0_0_20px_-8px_rgba(139,92,246,0.5)]',
    }
  }
  if (text.includes('saved') || text.includes('bookmark')) {
    return {
      Icon: BookmarkIcon,
      chip: 'Saved',
      chipClass: 'border-fuchsia-500/35 bg-fuchsia-500/12 text-fuchsia-300',
      iconWrap: 'bg-fuchsia-500/18 text-fuchsia-400 ring-1 ring-fuchsia-500/25',
    }
  }
  if (text.includes('trend') && !text.includes('saved')) {
    return {
      Icon: TrendingUpIcon,
      chip: 'Trend',
      chipClass: 'border-violet-500/30 bg-violet-500/12 text-violet-300',
      iconWrap: 'bg-violet-500/18 text-violet-400 ring-1 ring-violet-500/25',
    }
  }
  if (text.includes('hook')) {
    return {
      Icon: BoltIcon,
      chip: 'Hook',
      chipClass: 'border-amber-500/30 bg-amber-500/12 text-amber-300',
      iconWrap: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25',
    }
  }
  if (text.includes('analy') || text.includes('landing')) {
    return {
      Icon: ChartBarIcon,
      chip: 'Analytics',
      chipClass: 'border-indigo-500/30 bg-indigo-500/12 text-indigo-300',
      iconWrap: 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/25',
    }
  }
  if (text.includes('seo') || text.includes('title')) {
    return {
      Icon: MagnifyingGlassIcon,
      chip: 'SEO',
      chipClass: 'border-cyan-500/30 bg-cyan-500/12 text-cyan-300',
      iconWrap: 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/25',
    }
  }
  if (text.includes('ad') || text.includes('copy')) {
    return {
      Icon: SparklesIcon,
      chip: 'Ad Copy',
      chipClass: 'border-violet-500/30 bg-violet-500/12 text-violet-300',
      iconWrap: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/25',
    }
  }

  return {
    Icon: SparklesIcon,
    chip: 'AI',
    chipClass: 'border-zinc-700/70 bg-zinc-800/60 text-zinc-400',
    iconWrap: 'bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/80',
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
}: {
  item: ActivityItem
  isLatest: boolean
}) {
  const visual = getActivityVisual(item.tool, item.label)
  const { Icon } = visual

  return (
    <li>
      <div
        className={cn(
          'dashboard-os-activity-row dashboard-os-card glass-premium flex items-center gap-3 rounded-2xl border p-3 transition-smooth sm:gap-3.5 sm:p-3.5',
          isLatest
            ? 'border-emerald-500/25 shadow-[0_0_28px_-14px_rgba(52,211,153,0.35)]'
            : 'border-zinc-800/55',
        )}
      >
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11',
            visual.iconWrap,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-zinc-50">{item.label}</p>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                visual.chipClass,
              )}
            >
              {visual.chip}
            </span>
            {isLatest && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                <span className="relative flex size-1.5" aria-hidden>
                  <span className="ai-pulse-ring absolute inset-0 rounded-full bg-emerald-400/50" />
                  <span className="relative size-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            )}
          </div>
          <p className="dashboard-os-muted mt-0.5 truncate text-xs">{item.tool}</p>
        </div>

        <time className="dashboard-os-muted shrink-0 text-[10px] font-medium tabular-nums">
          {formatRelativeTime(item.timestamp)}
        </time>
      </div>
    </li>
  )
}

export function DashboardActivityTimeline() {
  const { activities } = useDashboardData()
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? activities : activities.slice(0, MAX_VISIBLE)
  const hasMore = activities.length > MAX_VISIBLE

  return (
    <section className="dashboard-os-section animate-fade-in animation-delay-400">
      <DashboardSubsectionHeader
        title="AI Activity Feed"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <AiPulseIndicator label="Live" size="sm" />
            {hasMore ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="text-xs font-medium text-violet-400 transition-smooth hover:text-violet-300"
              >
                {expanded ? 'Show less' : 'View all →'}
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
          description="Generate a video or save a trend — your AI feed will light up here."
          icon={<SparklesIcon className="size-5 text-violet-400/80" aria-hidden />}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ActivityRow item={item} isLatest={i === 0} />
            </div>
          ))}
        </ul>
      )}
    </section>
  )
}
