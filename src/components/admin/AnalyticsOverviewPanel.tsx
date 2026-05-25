import { memo } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { AdminOverviewSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { EMPTY_ADMIN_OVERVIEW } from '@/lib/admin-defaults'
import { fetchAdminOverview } from '@/lib/admin-api'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'

function AnalyticsOverviewPanelInner() {
  const { data, loading, warnings, authError, reload, loadId } = useAdminPanelLoad({
    scope: 'AnalyticsOverviewPanel',
    reloadKey: 'overview',
    load: fetchAdminOverview,
    empty: EMPTY_ADMIN_OVERVIEW,
  })

  if (loading && loadId === 0) return <AdminOverviewSkeleton />
  if (authError) {
    return <AdminErrorState message={authError} onRetry={() => void reload()} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Analytics Overview
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Plattform-KPIs aus Supabase Auth & Profilen.
        </p>
      </header>

      <AdminWarningBanner warnings={warnings} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Total Users" value={data.totalUsers ?? 0} accent="violet" />
        <AdminStatCard
          label="Active Users"
          value={data.activeUsers ?? 0}
          hint="Neu in den letzten 7 Tagen"
          accent="fuchsia"
        />
        <AdminStatCard
          label="Total Generations"
          value={data.totalGenerations ?? 0}
          accent="emerald"
        />
        <AdminStatCard label="Pro Users" value={data.proUsers ?? 0} accent="amber" />
        <AdminStatCard
          label="Revenue"
          value={data.revenuePlaceholder ?? '€ —'}
          hint="Stripe MRR Sync — coming soon"
          accent="violet"
          className="sm:col-span-2 xl:col-span-2"
        />
      </div>

      {(data.totalUsers ?? 0) === 0 && (
        <p className="text-center text-sm text-zinc-500">
          Noch keine Nutzer registriert — KPIs werden angezeigt, sobald sich jemand anmeldet
          (oder nach Deploy von admin-api).
        </p>
      )}
    </div>
  )
}

export const AnalyticsOverviewPanel = memo(AnalyticsOverviewPanelInner)
