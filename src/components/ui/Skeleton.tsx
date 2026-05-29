import { cn } from '@/lib'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('nex-skeleton animate-shimmer rounded-xl', className)}
      aria-hidden
    />
  )
}

export function TrendCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40',
        className,
      )}
    >
      <div className="relative aspect-[9/16] min-h-[280px] w-full sm:aspect-[9/15] sm:min-h-[300px]">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-12" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function TrendsGridSkeleton() {
  return (
    <div className="trend-feed mt-4 min-h-[520px]" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="trend-feed-item animate-fade-in"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <TrendCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-os nex-os-polish mx-auto max-w-6xl flex flex-col gap-3 sm:gap-4">
      <Skeleton className="h-44 w-full rounded-[var(--dash-radius-lg)] sm:h-48" />
      <div className="flex gap-2 overflow-hidden sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[5.5rem] min-w-[9.5rem] shrink-0 rounded-[var(--dash-radius)] sm:min-w-[11rem]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[var(--dash-radius)]" />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <Skeleton className="h-40 rounded-[var(--dash-radius-lg)] sm:col-span-3 sm:h-44" />
        <Skeleton className="h-28 rounded-[var(--dash-radius)]" />
        <Skeleton className="h-28 rounded-[var(--dash-radius)]" />
        <Skeleton className="h-28 rounded-[var(--dash-radius)]" />
      </div>
      <Skeleton className="h-52 w-full rounded-[var(--dash-radius-lg)]" />
      <Skeleton className="h-36 w-full rounded-[var(--dash-radius-lg)]" />
    </div>
  )
}
