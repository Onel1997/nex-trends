import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components'
import { DashboardMain } from '@/components/dashboard/DashboardMain'
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay'
import { UpgradeModal } from '@/components/subscription'
import type { DashboardToolId } from '@/lib'
import {
  DASHBOARD_NAVIGATE_EVENT,
  ensureDashboardPath,
  navigateToTool,
  readToolFromUrl,
  syncLegacyToolQueryToPath,
} from '@/lib/navigation'
import { BillingCancelPage } from '@/pages/BillingCancelPage'
import { BillingSuccessPage } from '@/pages/BillingSuccessPage'

function readBillingResultPath(): 'success' | 'cancel' | null {
  const path = window.location.pathname.replace(/\/$/, '')
  if (path === '/billing/success') return 'success'
  if (path === '/billing/cancel') return 'cancel'
  return null
}

export function HomePage() {
  const billingResult = readBillingResultPath()
  const [activeTool, setActiveTool] = useState<DashboardToolId>(() => {
    syncLegacyToolQueryToPath()
    return readToolFromUrl()
  })

  const handleSelectTool = useCallback((tool: DashboardToolId) => {
    setActiveTool(tool)
    navigateToTool(tool)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    ensureDashboardPath()
    syncLegacyToolQueryToPath()
    setActiveTool(readToolFromUrl())
  }, [])

  useEffect(() => {
    const syncFromUrl = () => setActiveTool(readToolFromUrl())

    window.addEventListener('popstate', syncFromUrl)
    window.addEventListener(DASHBOARD_NAVIGATE_EVENT, syncFromUrl)
    return () => {
      window.removeEventListener('popstate', syncFromUrl)
      window.removeEventListener(DASHBOARD_NAVIGATE_EVENT, syncFromUrl)
    }
  }, [])

  if (billingResult === 'success') {
    return <BillingSuccessPage />
  }

  if (billingResult === 'cancel') {
    return <BillingCancelPage />
  }

  return (
    <>
      <DashboardLayout activeTool={activeTool} onSelectTool={handleSelectTool}>
        <DashboardMain activeTool={activeTool} onSelectTool={handleSelectTool} />
      </DashboardLayout>
      {activeTool === 'dashboard' && (
        <OnboardingOverlay onNavigate={handleSelectTool} />
      )}
      <UpgradeModal />
    </>
  )
}
