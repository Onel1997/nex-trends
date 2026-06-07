import { memo, useCallback, useMemo, useState } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import {
  AdminChartCard,
  CreditsBarChart,
  GenerationsAreaChart,
  LiveCounterStrip,
  ToolsPieChart,
} from '@/components/admin/AdminCharts'
import { AdminOverviewSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminPeriodFilter } from '@/components/admin/AdminPeriodFilter'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { EMPTY_ADMIN_OVERVIEW } from '@/lib/admin-defaults'
import { fetchAdminAnalytics } from '@/lib/admin-api'
import { PLAN_ADMIN_LABELS, type AdminManageablePlan } from '@/lib/plans'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'
import type { AnalyticsPeriod } from '@/types/analytics'

const PLAN_STAT_ORDER: AdminManageablePlan[] = [
  'free',
  'creator',
  'pro_creator',
  'studio',
  'agency',
  'audio',
]

function AnalyticsOverviewPanelInner() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d')

  const load = useCallback(() => fetchAdminAnalytics(period), [period])

  const { data, loading, warnings, authError, reload, loadId } = useAdminPanelLoad({
    scope: 'AnalyticsOverviewPanel',
    reloadKey: period,
    load,
    empty: {
      period,
      totalGenerations: 0,
      creditsConsumed: 0,
      activeUsers: 0,
      topTools: [],
      topNiches: [],
      topPlatforms: [],
      dailySeries: [],
      recentGenerations: [],
      liveCounters: { last24h: 0, last7d: 0, last30d: 0 },
    },
  })

  const overview = useMemo(
    () => ({
      ...EMPTY_ADMIN_OVERVIEW,
      totalUsers: data.totalUsers ?? 0,
      activeUsers: data.activeUsers ?? 0,
      totalGenerations: data.totalGenerations ?? 0,
      proUsers: data.proUsers ?? 0,
      planCounts: data.planCounts ?? {},
      creditsConsumed: data.creditsConsumed ?? 0,
      revenuePlaceholder: data.revenuePlaceholder ?? EMPTY_ADMIN_OVERVIEW.revenuePlaceholder,
    }),
    [data],
  )

  const toolsPie = useMemo(
    () =>
      (data.topTools ?? []).map((t) => ({
        name: t.tool,
        count: t.count,
      })),
    [data.topTools],
  )

  if (loading && loadId === 0) return <AdminOverviewSkeleton />
  if (authError) {
    return <AdminErrorState message={authError} onRetry={() => void reload()} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Analytics Übersicht
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Echtzeit-KPIs aus AI-Generierungen, Credits und aktiven Nutzern.
          </p>
        </div>
        <AdminPeriodFilter value={period} onChange={setPeriod} disabled={loading} />
      </header>

      <AdminWarningBanner warnings={warnings} />

      <LiveCounterStrip counters={data.liveCounters ?? { last24h: 0, last7d: 0, last30d: 0 }} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Total Users" value={overview.totalUsers ?? 0} accent="violet" />
        <AdminStatCard
          label="Active Users"
          value={overview.activeUsers ?? 0}
          hint={`Im Zeitraum ${period}`}
          accent="fuchsia"
        />
        <AdminStatCard
          label="Generations"
          value={overview.totalGenerations ?? 0}
          accent="emerald"
        />
        <AdminStatCard
          label="Credits Used"
          value={overview.creditsConsumed ?? 0}
          accent="amber"
        />
        <AdminStatCard label="Bezahlte Nutzer" value={overview.proUsers ?? 0} accent="violet" />
        <AdminStatCard
          label="Revenue"
          value={overview.revenuePlaceholder ?? '€ —'}
          hint="Stripe MRR Sync — coming soon"
          accent="fuchsia"
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      {overview.planCounts && Object.keys(overview.planCounts).length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {PLAN_STAT_ORDER.map((planId) => (
            <div
              key={planId}
              className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2.5 text-center"
            >
              <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
                {PLAN_ADMIN_LABELS[planId]}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">
                {overview.planCounts?.[planId] ?? 0}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="Generations over time" subtitle="Tägliche AI-Aktivität">
          <GenerationsAreaChart data={data.dailySeries ?? []} />
        </AdminChartCard>
        <AdminChartCard title="Credits consumed" subtitle="Verbrauch pro Tag">
          <CreditsBarChart data={data.dailySeries ?? []} />
        </AdminChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="Most used tools" subtitle="Verteilung im Zeitraum">
          <ToolsPieChart data={toolsPie} />
        </AdminChartCard>
        <AdminChartCard title="Trending niches" subtitle="Top Such-Nischen">
          <div className="space-y-2">
            {(data.topNiches ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Noch keine Nischen-Daten.</p>
            ) : (
              (data.topNiches ?? []).map((row, i) => (
                <div
                  key={row.niche}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-zinc-200">
                    <span className="text-xs tabular-nums text-zinc-600">#{i + 1}</span>
                    {row.niche}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-violet-300">
                    {row.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </AdminChartCard>
      </div>
    </div>
  )
}

export const AnalyticsOverviewPanel = memo(AnalyticsOverviewPanelInner)
