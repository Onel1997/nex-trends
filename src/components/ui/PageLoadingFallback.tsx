import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib'
import type { DashboardToolId } from '@/lib'

type PageLoadingFallbackProps = {
  tool?: DashboardToolId
  className?: string
}

export function PageLoadingFallback({ tool, className }: PageLoadingFallbackProps) {
  if (tool === 'dashboard') {
    return (
      <div className={cn('dashboard-os nex-os-polish mx-auto max-w-6xl flex flex-col gap-3 sm:gap-4', className)}>
        <Skeleton className="h-44 w-full rounded-[var(--dash-radius-lg)] sm:h-48" />
        <div className="flex gap-2 overflow-hidden sm:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[5.5rem] min-w-[9.5rem] shrink-0 rounded-[var(--dash-radius)] sm:min-w-[11rem]" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-[var(--dash-radius-lg)]" />
        <Skeleton className="h-48 w-full rounded-[var(--dash-radius-lg)]" />
      </div>
    )
  }

  return (
    <div
      className={cn('mx-auto max-w-4xl animate-fade-in space-y-6', className)}
      role="status"
      aria-label="Seite wird geladen"
    >
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-2/3 max-w-sm" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  )
}
