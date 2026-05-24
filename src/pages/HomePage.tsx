import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components'
import { DashboardMain } from '@/components/dashboard/DashboardMain'
import { UpgradeModal } from '@/components/subscription'
import type { DashboardToolId } from '@/lib'
import { readToolFromUrl, writeToolToUrl } from '@/lib/navigation'

export function HomePage() {
  const [activeTool, setActiveTool] = useState<DashboardToolId>(() => readToolFromUrl())

  const handleSelectTool = useCallback((tool: DashboardToolId) => {
    setActiveTool(tool)
    writeToolToUrl(tool)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onPopState = () => {
      setActiveTool(readToolFromUrl())
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    writeToolToUrl(activeTool)
  }, [activeTool])

  return (
    <>
      <DashboardLayout activeTool={activeTool} onSelectTool={handleSelectTool}>
        <DashboardMain
          activeTool={activeTool}
          onNavigateHome={() => handleSelectTool('trends')}
        />
      </DashboardLayout>
      <UpgradeModal />
    </>
  )
}
