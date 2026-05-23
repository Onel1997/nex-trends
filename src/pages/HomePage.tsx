import { useCallback, useState } from 'react'
import { DashboardLayout } from '@/components'
import { DashboardMain } from '@/components/dashboard/DashboardMain'
import { MAX_CREDITS, type DashboardToolId } from '@/lib'

export function HomePage() {
  const [activeTool, setActiveTool] = useState<DashboardToolId>('trends')
  const [credits, setCredits] = useState(MAX_CREDITS)

  const decrementCredits = useCallback(() => {
    setCredits((current) => Math.max(0, current - 1))
  }, [])

  return (
    <DashboardLayout
      activeTool={activeTool}
      onSelectTool={setActiveTool}
      credits={credits}
    >
      <DashboardMain
        activeTool={activeTool}
        credits={credits}
        decrementCredits={decrementCredits}
      />
    </DashboardLayout>
  )
}
