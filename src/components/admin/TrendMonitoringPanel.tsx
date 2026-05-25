import { memo } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { AdminTrendSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EMPTY_ADMIN_TREND_STATS } from '@/lib/admin-defaults'
import { fetchAdminTrendStats } from '@/lib/admin-api'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('de-DE')
}

function TrendMonitoringPanelInner() {
  const { data, loading, warnings, authError, reload, loadId } = useAdminPanelLoad({
    scope: 'TrendMonitoringPanel',
    reloadKey: 'trends',
    load: fetchAdminTrendStats,
    empty: EMPTY_ADMIN_TREND_STATS,
  })

  if (loading && loadId === 0) return <AdminTrendSkeleton />
  if (authError) {
    return <AdminErrorState message={authError} onRetry={() => void reload()} />
  }

  const topNiches = data.topNiches ?? []
  const topPlatforms = data.topPlatforms ?? []
  const recentGenerations = data.recentGenerations ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Trend Monitoring</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Nischen-Suchen, Plattform-Präferenzen und letzte Generierungen.
        </p>
      </header>

      <AdminWarningBanner warnings={warnings} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="glass">
          <CardHeader>
            <h2 className="text-sm font-semibold text-white">Top Niches</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {topNiches.length === 0 ? (
              <p className="text-sm text-zinc-500">Noch keine Suchdaten.</p>
            ) : (
              topNiches.map((row) => (
                <div
                  key={row.niche}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200">{row.niche}</span>
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
        </CardHeader>
        <CardBody className="space-y-2">
          {recentGenerations.length === 0 ? (
            <p className="text-sm text-zinc-500">Noch keine Generierungen protokolliert.</p>
          ) : (
            recentGenerations.map((row, i) => (
              <div
                key={`${row.created_at ?? i}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800/50 bg-zinc-950/50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{row.tool ?? '—'}</p>
                  <p className="text-xs text-zinc-500">{row.label ?? '—'}</p>
                </div>
                <time className="text-xs tabular-nums text-zinc-600">
                  {formatDateTime(row.created_at)}
                </time>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export const TrendMonitoringPanel = memo(TrendMonitoringPanelInner)
