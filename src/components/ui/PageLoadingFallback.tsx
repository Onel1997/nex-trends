import { DashboardSkeleton, ToolPageSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib'
import type { DashboardToolId } from '@/lib'

type PageLoadingFallbackProps = {
  tool?: DashboardToolId
  className?: string
}

export function PageLoadingFallback({ tool, className }: PageLoadingFallbackProps) {
  if (tool === 'dashboard') {
    return <DashboardSkeleton />
  }

  return (
    <div
      className={cn('w-full min-w-0', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Seite wird geladen"
    >
      <ToolPageSkeleton tool={tool} />
    </div>
  )
}
