import { useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminOfflineBanner } from '@/components/admin/AdminOfflineBanner'
import { AnalyticsOverviewPanel } from '@/components/admin/AnalyticsOverviewPanel'
import { AdminCodeGeneratorPanel } from '@/components/admin/AdminCodeGeneratorPanel'
import { AdminControlsPanel } from '@/components/admin/AdminControlsPanel'
import { TrendMonitoringPanel } from '@/components/admin/TrendMonitoringPanel'
import { UserManagementPanel } from '@/components/admin/UserManagementPanel'
import { AppBootstrapSkeleton } from '@/components/ui/loading-states'
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
      <AdminSectionPanel active={section === 'code'}>
        <AdminCodeGeneratorPanel />
      </AdminSectionPanel>
    </AdminLayout>
  )
}

export function AdminPage() {
  const { isReady, isAllowed } = useAdminGuard()

  if (!isReady || !isAllowed) {
    return (
      <div className="min-h-svh bg-zinc-950">
        <AppBootstrapSkeleton label="Admin-Zugang wird geprüft …" />
      </div>
    )
  }

  return (
    <AdminEdgeProvider>
      <AdminPageContent />
    </AdminEdgeProvider>
  )
}
