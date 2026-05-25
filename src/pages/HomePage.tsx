import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components'
import { DashboardMain } from '@/components/dashboard/DashboardMain'
import { UpgradeModal } from '@/components/subscription'
import type { DashboardToolId } from '@/lib'
import {
  ensureDashboardPath,
  navigateToTool,
  readToolFromUrl,
  syncLegacyToolQueryToPath,
} from '@/lib/navigation'

export function HomePage() {
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
    const onPopState = () => {
      setActiveTool(readToolFromUrl())
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <>
      <DashboardLayout activeTool={activeTool} onSelectTool={handleSelectTool}>
        <DashboardMain activeTool={activeTool} onSelectTool={handleSelectTool} />
      </DashboardLayout>
      <UpgradeModal />
    </>
  )
}
