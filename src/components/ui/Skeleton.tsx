import { cn } from '@/lib'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer rounded-xl bg-zinc-800/40', className)}
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
    <div className="dashboard-os mx-auto max-w-6xl flex flex-col gap-7">
      <Skeleton className="h-44 w-full rounded-3xl sm:h-52" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 min-w-[11rem] shrink-0 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-56 rounded-2xl md:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}
