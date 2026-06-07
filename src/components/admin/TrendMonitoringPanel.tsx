import { memo, useCallback, useMemo, useState } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import {
  AdminChartCard,
  HorizontalRankChart,
} from '@/components/admin/AdminCharts'
import { AdminTrendSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminPeriodFilter } from '@/components/admin/AdminPeriodFilter'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EMPTY_ADMIN_TREND_STATS } from '@/lib/admin-defaults'
import { fetchAdminTrendStats } from '@/lib/admin-api'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'
import type { AnalyticsPeriod } from '@/types/analytics'

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('de-DE')
}

function TrendMonitoringPanelInner() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d')

  const load = useCallback(() => fetchAdminTrendStats(period), [period])

  const { data, loading, warnings, authError, reload, loadId } = useAdminPanelLoad({
    scope: 'TrendMonitoringPanel',
    reloadKey: period,
    load,
    empty: { ...EMPTY_ADMIN_TREND_STATS, period },
  })

  const topNiches = data.topNiches ?? []
  const topPlatforms = data.topPlatforms ?? []
  const topTools = data.topTools ?? []
  const recentGenerations = data.recentGenerations ?? []

  const platformChart = useMemo(
    () => topPlatforms.map((p) => ({ name: p.platform, count: p.count })),
    [topPlatforms],
  )

  const toolsChart = useMemo(
    () => topTools.map((t) => ({ name: t.tool, count: t.count })),
    [topTools],
  )

  if (loading && loadId === 0) return <AdminTrendSkeleton />
  if (authError) {
    return <AdminErrorState message={authError} onRetry={() => void reload()} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Trend Monitoring</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Nischen, Plattformen, Tools und letzte AI-Generierungen.
          </p>
        </div>
        <AdminPeriodFilter value={period} onChange={setPeriod} disabled={loading} />
      </header>

      <AdminWarningBanner warnings={warnings} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-950/40 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Generations ({period})
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-300">
            {(data.totalGenerations ?? recentGenerations.length).toLocaleString('de-DE')}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800/50 bg-zinc-950/40 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Credits consumed
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-300">
            {(data.creditsConsumed ?? 0).toLocaleString('de-DE')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="Platform usage" subtitle="Generierungen pro Plattform">
          <HorizontalRankChart data={platformChart} color="#d946ef" />
        </AdminChartCard>
        <AdminChartCard title="Tool leaderboard" subtitle="Meistgenutzte AI-Tools">
          <HorizontalRankChart data={toolsChart} color="#8b5cf6" />
        </AdminChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-sm font-semibold text-white">Top Niches</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {topNiches.length === 0 ? (
              <p className="text-sm text-zinc-500">Noch keine Suchdaten.</p>
            ) : (
              topNiches.map((row, i) => (
                <div
                  key={row.niche}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200">
                    <span className="mr-2 text-xs text-zinc-600">#{i + 1}</span>
                    {row.niche}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-violet-300">
                    {row.count ?? 0}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <h2 className="text-sm font-semibold text-white">Platforms</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {topPlatforms.length === 0 ? (
              <p className="text-sm text-zinc-500">Noch keine Plattform-Daten.</p>
            ) : (
              topPlatforms.map((row) => (
                <div
                  key={row.platform}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200">{row.platform}</span>
                  <span className="text-sm font-semibold tabular-nums text-fuchsia-300">
                    {row.count ?? 0}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card variant="glass">
        <CardHeader>
          <h2 className="text-sm font-semibold text-white">Recent Generations</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Live-Feed aus ai_generations</p>
        </CardHeader>
        <CardBody className="space-y-2">
          {recentGenerations.length === 0 ? (
            <p className="text-sm text-zinc-500">Noch keine Generierungen protokolliert.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                    <th className="pb-2 pr-3">Tool</th>
                    <th className="pb-2 pr-3">User</th>
                    <th className="pb-2 pr-3">Niche</th>
                    <th className="pb-2 pr-3">Platform</th>
                    <th className="pb-2 pr-3 text-right">Credits</th>
                    <th className="pb-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGenerations.map((row, i) => (
                    <tr
                      key={`${row.created_at ?? i}-${i}`}
                      className="border-b border-zinc-800/30 last:border-0"
                    >
                      <td className="py-2.5 pr-3 font-medium text-zinc-200">
                        {row.tool ?? '—'}
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-zinc-500">
                        {row.email ?? '—'}
                      </td>
                      <td className="py-2.5 pr-3 text-zinc-400">{row.niche || '—'}</td>
                      <td className="py-2.5 pr-3 text-zinc-400">{row.platform || '—'}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-amber-300/90">
                        {row.credits_used ?? 1}
                      </td>
                      <td className="py-2.5 text-right text-xs tabular-nums text-zinc-600">
                        {formatDateTime(row.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export const TrendMonitoringPanel = memo(TrendMonitoringPanelInner)
