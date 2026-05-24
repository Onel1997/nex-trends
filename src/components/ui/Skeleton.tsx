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
      <Skeleton className="aspect-[16/10] w-full rounded-none sm:aspect-video" />
      <div className="space-y-3 p-5">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export function TrendsGridSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <TrendCardSkeleton key={i} />
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
