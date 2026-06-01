'use client'

import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib'

export function TrendFeedSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-1" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-[min(82vw,17.5rem)] shrink-0 space-y-3 rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4"
        >
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GeneratorSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn('h-16 w-full rounded-xl', i === 0 && 'h-20')} />
      ))}
    </div>
  )
}

export function SavedTrendsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  )
}
