'use client'

import { TrendFeedCardSkeleton } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib'

export function TrendFeedSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 max-md:overflow-x-hidden md:flex-row md:gap-3 md:overflow-hidden"
      aria-hidden
      aria-busy="true"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="w-full min-w-0 md:w-auto md:shrink-0"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <TrendFeedCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function GeneratorSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'hook-skeleton-card rounded-xl border border-zinc-800/50 p-4',
            i === 0 && 'min-h-[5rem]',
          )}
        >
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-[90%]" />
          {i === 0 && <Skeleton className="mt-3 h-4 w-[70%]" />}
        </div>
      ))}
    </div>
  )
}

export function SavedTrendsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-hidden aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800/50 bg-zinc-950/40 p-4"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex justify-between gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
