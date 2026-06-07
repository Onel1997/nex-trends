'use client'

import { memo, useMemo, useState, type ReactNode, type SVGProps } from 'react'
import { SparklesIcon, TrendingUpIcon } from '@/components/ui/icons'
import {
  buildTrendDashboardSnapshot,
  resolveDashboardTrendId,
  type TrendDashboardItem,
  type TrendDashboardLayout,
  type TrendDashboardSection,
} from '@/lib/trend-dashboard'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import { cn } from '@/lib'

const TOP_VISIBLE = 3

type TrendIntelligenceDashboardProps = {
  trends: TrendIntelligence[]
  className?: string
  onSelectTrend?: (trendId: string) => void
}

function MetricPill({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'ti-metric-pill min-w-0 rounded-xl border px-3 py-2.5 backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-3',
        accent
          ? 'border-violet-500/25 bg-violet-500/10 shadow-[0_0_24px_-12px_rgba(139,92,246,0.4)]'
          : 'border-zinc-800/55 bg-zinc-950/55',
      )}
    >
      <p className="text-[8px] font-semibold uppercase tracking-widest text-zinc-500 sm:text-[9px]">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-base font-semibold tabular-nums tracking-tight sm:mt-1 sm:text-lg',
          accent ? 'text-violet-200' : 'text-white',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PlatformDistribution({ items }: { items: TrendDashboardItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="ti-platform-strip" aria-label="Plattform-Verteilung">
      {items.map((item) => (
        <div key={item.id} className="ti-platform-stat">
          <span className="ti-platform-stat__label">{item.label}</span>
          <span className="ti-platform-stat__count tabular-nums">{item.score ?? 0}</span>
        </div>
      ))}
    </div>
  )
}

function ShowMoreToggle({
  total,
  expanded,
  onToggle,
}: {
  total: number
  expanded: boolean
  onToggle: () => void
}) {
  if (total <= TOP_VISIBLE) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      className="ti-dash-show-more"
      aria-expanded={expanded}
    >
      {expanded ? 'Weniger anzeigen' : `Mehr anzeigen (${total - TOP_VISIBLE})`}
      <ChevronDownIcon
        className={cn('size-3.5 transition-transform duration-300', expanded && 'rotate-180')}
        aria-hidden
      />
    </button>
  )
}

function CollapsibleBlock({
  section,
  children,
}: {
  section: TrendDashboardSection
  children: ReactNode
}) {
  const [open, setOpen] = useState(section.defaultExpanded ?? true)

  return (
    <section className={cn('ti-dash-section', open && 'ti-dash-section--open')}>
      <button
        type="button"
        className="ti-dash-section__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="min-w-0 text-left">
          <span className="ti-dash-section__title">{section.title}</span>
          <span className="ti-dash-section__subtitle">{section.subtitle}</span>
        </span>
        <ChevronDownIcon
          className={cn(
            'ti-dash-section__chevron size-4 shrink-0 text-zinc-500',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'ti-dash-section__collapse',
          open && 'ti-dash-section__collapse--open',
        )}
        aria-hidden={!open}
      >
        <div className="ti-dash-section__body ti-dash-section__body--animate">{children}</div>
      </div>
    </section>
  )
}

function DashboardSecondaryStats({
  snapshot,
}: {
  snapshot: ReturnType<typeof buildTrendDashboardSnapshot>
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('ti-dash-overview', open && 'ti-dash-overview--open')}>
      <button
        type="button"
        className="ti-dash-overview__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="min-w-0 text-left">
          <span className="ti-dash-overview__title">Übersicht & Statistiken</span>
          <span className="ti-dash-overview__subtitle">
            Ø Chance {snapshot.avgOpportunity} · {snapshot.explodingCount} explodierend
          </span>
        </span>
        <ChevronDownIcon
          className={cn(
            'size-3.5 shrink-0 text-zinc-500 transition-transform duration-300',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'ti-dash-overview__collapse',
          open && 'ti-dash-overview__collapse--open',
        )}
        aria-hidden={!open}
      >
        <div className="ti-dash-overview__body ti-dash-section__body--animate">
          <div className="ti-dashboard-metrics grid grid-cols-2 gap-2 sm:gap-2.5">
            <MetricPill label="Ø Chance" value={snapshot.avgOpportunity} accent />
            <MetricPill label="Explodiert" value={snapshot.explodingCount} />
            <MetricPill label="Im Trend" value={snapshot.risingCount} />
            <MetricPill label="Top Plattform" value={snapshot.topPlatform} />
          </div>
          {snapshot.platformStats.length > 0 && (
            <div className="mt-2.5">
              <p className="mb-1.5 px-0.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                Plattform-Verteilung
              </p>
              <PlatformDistribution items={snapshot.platformStats} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function createSelectHandler(
  trends: TrendIntelligence[],
  onSelectTrend?: (trendId: string) => void,
) {
  return (item: TrendDashboardItem) => {
    const trendId = resolveDashboardTrendId(item, trends)
    if (trendId) onSelectTrend?.(trendId)
  }
}

function LeaderboardList({
  items,
  trends,
  onSelectTrend,
}: {
  items: TrendDashboardItem[]
  trends: TrendIntelligence[]
  onSelectTrend?: (trendId: string) => void
}) {
  const selectItem = createSelectHandler(trends, onSelectTrend)
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, TOP_VISIBLE)

  return (
    <>
      <ol className={cn('ti-leaderboard', expanded && 'ti-list-reveal--open')}>
        {visible.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => selectItem(item)}
              className="ti-leaderboard-row"
            >
              <span className="ti-leaderboard-row__rank tabular-nums">#{index + 1}</span>
              <span className="ti-leaderboard-row__label">{item.label}</span>
              {item.score != null && (
                <span className="ti-leaderboard-row__score tabular-nums">{item.score}</span>
              )}
            </button>
          </li>
        ))}
      </ol>
      <ShowMoreToggle
        total={items.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    </>
  )
}

function HookScoreRows({
  items,
  trends,
  onSelectTrend,
}: {
  items: TrendDashboardItem[]
  trends: TrendIntelligence[]
  onSelectTrend?: (trendId: string) => void
}) {
  const selectItem = createSelectHandler(trends, onSelectTrend)
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, TOP_VISIBLE)

  return (
    <>
      <ul className={cn('ti-hook-rows', expanded && 'ti-list-reveal--open')}>
        {visible.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => selectItem(item)}
              className="ti-hook-row"
            >
              {item.score != null && (
                <span className="ti-hook-row__score tabular-nums">{item.score}</span>
              )}
              <span className="ti-hook-row__text">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <ShowMoreToggle
        total={items.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    </>
  )
}

function KeywordChipGrid({
  items,
  trends,
  onSelectTrend,
}: {
  items: TrendDashboardItem[]
  trends: TrendIntelligence[]
  onSelectTrend?: (trendId: string) => void
}) {
  const selectItem = createSelectHandler(trends, onSelectTrend)
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, TOP_VISIBLE)

  return (
    <>
      <div
        className={cn('ti-keyword-grid', expanded && 'ti-list-reveal--open')}
        role="list"
      >
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => selectItem(item)}
            className="ti-keyword-chip"
          >
            <span className="ti-keyword-chip__tag">{item.label}</span>
            {item.score != null && (
              <span className="ti-keyword-chip__score tabular-nums">{item.score}</span>
            )}
          </button>
        ))}
      </div>
      <ShowMoreToggle
        total={items.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    </>
  )
}

function SignalRows({
  items,
  trends,
  onSelectTrend,
}: {
  items: TrendDashboardItem[]
  trends: TrendIntelligence[]
  onSelectTrend?: (trendId: string) => void
}) {
  const selectItem = createSelectHandler(trends, onSelectTrend)
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, TOP_VISIBLE)

  return (
    <>
      <ul className={cn('ti-signal-rows', expanded && 'ti-list-reveal--open')}>
        {visible.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => selectItem(item)}
              className="ti-signal-row"
            >
              {item.score != null && (
                <span className="ti-signal-row__score tabular-nums">{item.score}</span>
              )}
              <span className="ti-signal-row__text">{item.label}</span>
              {item.meta && <span className="ti-signal-row__meta">{item.meta}</span>}
            </button>
          </li>
        ))}
      </ul>
      <ShowMoreToggle
        total={items.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    </>
  )
}

function SectionContent({
  layout,
  items,
  trends,
  onSelectTrend,
}: {
  layout: TrendDashboardLayout
  items: TrendDashboardItem[]
  trends: TrendIntelligence[]
  onSelectTrend?: (trendId: string) => void
}) {
  switch (layout) {
    case 'leaderboard':
      return <LeaderboardList items={items} trends={trends} onSelectTrend={onSelectTrend} />
    case 'hook-rows':
      return <HookScoreRows items={items} trends={trends} onSelectTrend={onSelectTrend} />
    case 'keyword-chips':
      return <KeywordChipGrid items={items} trends={trends} onSelectTrend={onSelectTrend} />
    case 'signal-rows':
      return <SignalRows items={items} trends={trends} onSelectTrend={onSelectTrend} />
    case 'platform-stats':
      return <PlatformDistribution items={items} />
    default:
      return null
  }
}

function TrendIntelligenceDashboardInner({
  trends,
  className,
  onSelectTrend,
}: TrendIntelligenceDashboardProps) {
  const snapshot = useMemo(() => buildTrendDashboardSnapshot(trends), [trends])

  if (trends.length === 0) return null

  return (
    <div
      className={cn(
        'ti-dashboard ti-dashboard--compact animate-fade-in rounded-2xl border border-violet-500/15',
        'bg-gradient-to-b from-violet-500/[0.07] via-zinc-950/40 to-zinc-950/20 p-3 shadow-[0_0_60px_-32px_rgba(139,92,246,0.45)] backdrop-blur-md sm:p-4',
        className,
      )}
    >
      <div className="ti-dashboard__header flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-violet-400/90 sm:text-[10px]">
            <SparklesIcon className="size-3 shrink-0" aria-hidden />
            Intelligence-Übersicht
          </p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white sm:text-lg">
            Creator Signal Übersicht
          </h2>
          <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-xs">
            {trends.length} Live Signale · {snapshot.topPlatform} führend
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] font-medium text-emerald-300">
          <TrendingUpIcon className="size-2.5" aria-hidden />
          Live
        </span>
      </div>

      <DashboardSecondaryStats snapshot={snapshot} />

      <div className="ti-dashboard__sections mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
        {snapshot.sections.map((section) => {
          if (section.items.length === 0) return null
          return (
            <CollapsibleBlock key={section.id} section={section}>
              <SectionContent
                layout={section.layout}
                items={section.items}
                trends={trends}
                onSelectTrend={onSelectTrend}
              />
            </CollapsibleBlock>
          )
        })}
      </div>
    </div>
  )
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export const TrendIntelligenceDashboard = memo(TrendIntelligenceDashboardInner)
