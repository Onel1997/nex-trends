import { useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminOfflineBanner } from '@/components/admin/AdminOfflineBanner'
import { AnalyticsOverviewPanel } from '@/components/admin/AnalyticsOverviewPanel'
import { AdminControlsPanel } from '@/components/admin/AdminControlsPanel'
import { TrendMonitoringPanel } from '@/components/admin/TrendMonitoringPanel'
import { UserManagementPanel } from '@/components/admin/UserManagementPanel'
import { Spinner } from '@/components/ui/Spinner'
import { AdminEdgeProvider } from '@/context/AdminEdgeContext'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { cn } from '@/lib'
import type { AdminSection } from '@/types/admin'

/** Keep panels mounted but hidden — avoids reload flicker when switching tabs */
function AdminSectionPanel({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn(!active && 'hidden')} aria-hidden={!active}>
      {children}
    </div>
  )
}

function AdminPageContent() {
  const [section, setSection] = useState<AdminSection>('overview')

  return (
    <AdminLayout activeSection={section} onSectionChange={setSection}>
      <AdminOfflineBanner />
      <AdminSectionPanel active={section === 'overview'}>
        <AnalyticsOverviewPanel />
      </AdminSectionPanel>
      <AdminSectionPanel active={section === 'users'}>
        <UserManagementPanel />
      </AdminSectionPanel>
      <AdminSectionPanel active={section === 'trends'}>
        <TrendMonitoringPanel />
      </AdminSectionPanel>
      <AdminSectionPanel active={section === 'controls'}>
        <AdminControlsPanel />
      </AdminSectionPanel>
    </AdminLayout>
  )
}

export function AdminPage() {
  const { isReady, isAllowed } = useAdminGuard()

  if (!isReady || !isAllowed) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950">
        <Spinner size="lg" label="Admin-Zugang wird geprüft …" />
      </div>
    )
  }

  return (
    <AdminEdgeProvider>
      <AdminPageContent />
    </AdminEdgeProvider>
  )
}
