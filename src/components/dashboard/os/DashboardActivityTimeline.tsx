import { memo, useState } from 'react'
import { DashboardEmptyIllustration } from '@/components/dashboard/os/DashboardEmptyIllustration'
import { DashboardOnboardingEmpty } from '@/components/dashboard/os/DashboardOnboardingEmpty'
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
import type { ActivityItem, ActivityKind } from '@/types/dashboard'
import type { DashboardRouteId } from '@/lib/routes'
import { cn } from '@/lib'

const MAX_VISIBLE = 5

type ActivityVisual = {
  Icon: typeof SparklesIcon
  chip: string
}

type DashboardActivityTimelineProps = {
  activities: ActivityItem[]
  onNavigate?: (tool: DashboardRouteId) => void
}

function getActivityVisual(kind: ActivityKind | undefined, tool: string, label: string): ActivityVisual {
  switch (kind) {
    case 'video':
      return { Icon: ClapperboardIcon, chip: 'Video' }
    case 'audit':
      return { Icon: ChartBarIcon, chip: 'Audit' }
    case 'seo':
      return { Icon: MagnifyingGlassIcon, chip: 'SEO' }
    case 'ad_copy':
      return { Icon: SparklesIcon, chip: 'Ad Copy' }
    case 'hook':
      return { Icon: BoltIcon, chip: 'Hook' }
    case 'saved':
      return { Icon: BookmarkIcon, chip: 'Saved' }
    case 'trend':
      return { Icon: TrendingUpIcon, chip: 'Trend' }
    default:
      break
  }

  const text = `${tool} ${label}`.toLowerCase()
  if (text.includes('video') || text.includes('studio')) {
    return { Icon: ClapperboardIcon, chip: 'Video' }
  }
  if (text.includes('analy') || text.includes('landing')) {
    return { Icon: ChartBarIcon, chip: 'Audit' }
  }
  if (text.includes('seo') || text.includes('title')) {
    return { Icon: MagnifyingGlassIcon, chip: 'SEO' }
  }
  if (text.includes('ad')) {
    return { Icon: SparklesIcon, chip: 'Ad Copy' }
  }
  if (text.includes('hook')) {
    return { Icon: BoltIcon, chip: 'Hook' }
  }
  return { Icon: SparklesIcon, chip: 'AI' }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `Vor ${minutes} Min.`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Vor ${days} Tag${days === 1 ? '' : 'en'}`
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

const ActivityTimelineNode = memo(function ActivityTimelineNode({
  item,
  isLatest,
  isLast,
  index,
}: {
  item: ActivityItem
  isLatest: boolean
  isLast: boolean
  index: number
}) {
  const visual = getActivityVisual(item.kind, item.tool, item.label)
  const { Icon } = visual

  return (
    <li
      className="dashboard-os-timeline__item relative flex gap-2.5 pb-2.5 last:pb-0"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="dashboard-os-timeline__rail flex w-[0.875rem] shrink-0 flex-col items-center">
        <span
          className={cn(
            'relative z-[1] flex size-[0.5rem] rounded-full transition-smooth',
            isLatest
              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]'
              : 'bg-zinc-600',
          )}
        />
        {!isLast ? (
          <span className="dashboard-os-timeline__line mt-1.5 w-px flex-1 min-h-[1.85rem]" aria-hidden />
        ) : null}
      </div>

      <article
        className={cn(
          'dashboard-os-activity-card nex-card-interactive min-w-0 flex-1 rounded-[var(--dash-radius)] border px-3 py-2.5 touch-manipulation sm:py-2.5',
          isLatest
            ? 'border-violet-500/20 bg-violet-500/[0.05] nex-border-glow'
            : 'border-zinc-800/50 bg-zinc-950/40',
        )}
      >
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg border transition-smooth',
              isLatest
                ? 'border-violet-500/25 bg-violet-500/12 text-violet-300'
                : 'border-zinc-800/60 bg-zinc-900/80 text-violet-400/85',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-snug text-zinc-100 sm:text-xs">
                {item.label}
              </p>
              <span className="dashboard-os-activity-chip shrink-0">{visual.chip}</span>
              {isLatest ? (
                <span className="dashboard-os-activity-chip dashboard-os-activity-chip--live shrink-0">
                  Neu
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-[10px] text-zinc-500">{item.tool}</p>
          </div>

          <time
            dateTime={item.timestamp}
            className="shrink-0 pt-0.5 text-[9px] font-medium tabular-nums tracking-wide text-zinc-500"
            title={new Date(item.timestamp).toLocaleString('de-DE')}
          >
            {formatRelativeTime(item.timestamp)}
          </time>
        </div>
      </article>
    </li>
  )
})

function DashboardActivityTimelineInner({
  activities,
  onNavigate,
}: DashboardActivityTimelineProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? activities : activities.slice(0, MAX_VISIBLE)
  const hasMore = activities.length > MAX_VISIBLE

  return (
    <section className="dashboard-os-section dashboard-os-section--embedded">
      <DashboardSubsectionHeader
        title="Recent Activity"
        action={
          <div className="flex shrink-0 items-center gap-2">
            <AiPulseIndicator label="Live" size="sm" />
            {hasMore ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="min-h-9 rounded-md px-2 text-[10px] font-medium text-zinc-500 transition-smooth hover:text-violet-300 touch-manipulation"
              >
                {expanded ? 'Weniger' : 'Alle'} →
              </button>
            ) : null}
          </div>
        }
      />

      {activities.length === 0 ? (
        <DashboardOnboardingEmpty
          compact
          illustration={
            <DashboardEmptyIllustration variant="activity" className="mx-auto w-full max-w-[140px]" />
          }
          title="Dein Activity Feed wartet"
          description="Generiere Hooks, speichere Titel oder starte ein AI-Tool — alles erscheint hier live."
          action={
            onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate('hook')}
                className="dashboard-os-btn dashboard-os-btn-primary inline-flex h-10 min-w-[10rem] items-center justify-center rounded-[var(--dash-radius)] px-4 text-[11px] touch-manipulation"
              >
                Erste Hooks generieren
              </button>
            ) : undefined
          }
          className="nex-glass-panel rounded-[var(--dash-radius)] border border-zinc-800/45"
        />
      ) : (
        <div className="dashboard-os-timeline nex-glass-panel rounded-[var(--dash-radius)] border border-zinc-800/45 p-3 sm:p-2.5">
          <ul>
            {visible.map((item, i) => (
              <ActivityTimelineNode
                key={item.id}
                item={item}
                index={i}
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

export const DashboardActivityTimeline = memo(DashboardActivityTimelineInner)
