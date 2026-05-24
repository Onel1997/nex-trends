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

export function TrendCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40">
      <div className="relative aspect-[9/14] w-full sm:aspect-[9/15]">
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
    <div className="trends-masonry mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="trends-masonry-item" style={{ animationDelay: `${i * 80}ms` }}>
          <TrendCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  )
}

