import { useState } from 'react'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
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
  emoji: string
}

function getActivityVisual(tool: string, label: string): ActivityVisual {
  const text = `${tool} ${label}`.toLowerCase()

  if (text.includes('video') || text.includes('studio') || text.includes('generat')) {
    return {
      Icon: ClapperboardIcon,
      chip: 'AI Video',
      chipClass: 'border-violet-500/35 bg-violet-500/12 text-violet-300 shadow-[0_0_16px_-6px_rgba(139,92,246,0.4)]',
      iconWrap: 'bg-violet-500/18 text-violet-400 ring-1 ring-violet-500/25',
      emoji: '🎥',
    }
  }
  if (text.includes('saved') || text.includes('bookmark')) {
    return {
      Icon: BookmarkIcon,
      chip: 'Trend Saved',
      chipClass: 'border-fuchsia-500/35 bg-fuchsia-500/12 text-fuchsia-300',
      iconWrap: 'bg-fuchsia-500/18 text-fuchsia-400 ring-1 ring-fuchsia-500/25',
      emoji: '🔥',
    }
  }
  if (text.includes('trend') && !text.includes('saved')) {
    return {
      Icon: TrendingUpIcon,
      chip: 'Trend',
      chipClass: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300',
      iconWrap: 'bg-fuchsia-500/15 text-fuchsia-400',
      emoji: '📈',
    }
  }
  if (text.includes('score') || text.includes('increas')) {
    return {
      Icon: TrendingUpIcon,
      chip: 'Growth',
      chipClass: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300',
      iconWrap: 'bg-emerald-500/15 text-emerald-400',
      emoji: '📈',
    }
  }
  if (text.includes('hook')) {
    return {
      Icon: BoltIcon,
      chip: 'Hook',
      chipClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      iconWrap: 'bg-amber-500/15 text-amber-400',
      emoji: '✍️',
    }
  }
  if (text.includes('analy') || text.includes('landing')) {
    return {
      Icon: ChartBarIcon,
      chip: 'Analytics',
      chipClass: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
      iconWrap: 'bg-indigo-500/15 text-indigo-300',
      emoji: '📊',
    }
  }
  if (text.includes('seo') || text.includes('title')) {
    return {
      Icon: MagnifyingGlassIcon,
      chip: 'SEO',
      chipClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
      iconWrap: 'bg-cyan-500/15 text-cyan-300',
      emoji: '✍️',
    }
  }
  if (text.includes('ad') || text.includes('copy')) {
    return {
      Icon: SparklesIcon,
      chip: 'Ad Copy',
      chipClass: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
      iconWrap: 'bg-violet-500/15 text-violet-400',
      emoji: '✨',
    }
  }

  return {
    Icon: SparklesIcon,
    chip: 'AI',
    chipClass: 'border-zinc-700/80 bg-zinc-800/60 text-zinc-400',
    iconWrap: 'bg-zinc-800 text-zinc-400',
    emoji: '⚡',
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

function ActivityCard({ item, isLatest }: { item: ActivityItem; isLatest: boolean }) {
  const visual = getActivityVisual(item.tool, item.label)
  const { Icon } = visual

  return (
    <li className="relative pl-0">
      <div
        className={cn(
          'dashboard-os-activity-card glass-premium flex gap-3.5 rounded-2xl p-4 sm:p-4',
          isLatest && 'border-emerald-500/15',
        )}
      >
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl text-lg',
            visual.iconWrap,
          )}
          aria-hidden
        >
          <span className="sr-only">{visual.emoji}</span>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-100">{item.label}</p>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                visual.chipClass,
              )}
            >
              {visual.chip}
            </span>
            {isLatest && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                <span className="ai-pulse-ring relative size-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500">{item.tool}</p>
        </div>
        <time className="shrink-0 self-start text-[10px] font-medium tabular-nums text-zinc-600">
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
    <section className="animate-fade-in animation-delay-400">
      <DashboardSectionHeading
        title="AI Activity Feed"
        description="Real-time log of your creator system — videos, trends, and tools."
        action={
          hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-xs font-medium text-violet-400 transition-smooth hover:text-violet-300"
            >
              {expanded ? 'Show less' : 'View all activity →'}
            </button>
          ) : undefined
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
        <ul className="relative space-y-2">
          <div
            className="absolute bottom-2 left-[1.35rem] top-2 w-px bg-gradient-to-b from-violet-500/40 via-zinc-700/50 to-transparent"
            aria-hidden
          />
          {visible.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <ActivityCard item={item} isLatest={i === 0} />
            </div>
          ))}
        </ul>
      )}
    </section>
  )
}
