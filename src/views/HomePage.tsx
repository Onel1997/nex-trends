'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { getBrowserPathname, isBrowser } from '@/lib/runtime'
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
import { getPathForTool } from '@/lib/routes'
import { BillingCancelPage } from '@/views/BillingCancelPage'
import { BillingSuccessPage } from '@/views/BillingSuccessPage'

function readBillingResultPath(): 'success' | 'cancel' | null {
  if (!isBrowser()) return null
  const path = getBrowserPathname().replace(/\/$/, '')
  if (path === '/billing/success') return 'success'
  if (path === '/billing/cancel') return 'cancel'
  return null
}

export function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const billingResult = readBillingResultPath()
  const [activeTool, setActiveTool] = useState<DashboardToolId>(() => readToolFromUrl())

  const handleSelectTool = useCallback(
    (tool: DashboardToolId) => {
      const path = getPathForTool(tool)
      setActiveTool(tool)

      // Next.js router for /dashboard/* — pushState alone desyncs the app on mobile Safari.
      if (path.startsWith('/dashboard')) {
        router.push(path)
      } else {
        navigateToTool(tool)
      }

      if (isBrowser()) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [router],
  )

  useEffect(() => {
    ensureDashboardPath()
    syncLegacyToolQueryToPath()
    setActiveTool(readToolFromUrl())
  }, [])

  useEffect(() => {
    setActiveTool(readToolFromUrl())
  }, [pathname])

  useEffect(() => {
    if (!isBrowser()) return

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
    <AuthGuard>
      <DashboardLayout activeTool={activeTool} onSelectTool={handleSelectTool}>
        <DashboardMain activeTool={activeTool} onSelectTool={handleSelectTool} />
      </DashboardLayout>
      {activeTool === 'dashboard' && (
        <OnboardingOverlay onNavigate={handleSelectTool} />
      )}
      <UpgradeModal />
    </AuthGuard>
  )
}
