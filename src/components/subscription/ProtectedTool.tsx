import type { ReactNode } from 'react'
import { ToolAccessGate } from '@/components/billing/ToolAccessGate'
import type { DashboardRouteId } from '@/lib/routes'

type ProtectedToolProps = {
  children: ReactNode
  toolId: DashboardRouteId
  title?: string
  description?: string
  className?: string
}

/** Server-aligned route guard for premium NexTrends modules */
export function ProtectedTool({
  children,
  toolId,
  title,
  description,
  className,
}: ProtectedToolProps) {
  return (
    <ToolAccessGate
      routeId={toolId}
      title={title}
      description={description}
      className={className}
    >
      {children}
    </ToolAccessGate>
  )
}
