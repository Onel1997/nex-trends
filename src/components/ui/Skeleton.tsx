import type { CSSProperties } from 'react'
import { cn } from '@/lib'
import type { DashboardToolId } from '@/lib'

type SkeletonProps = {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('nex-skeleton nex-shimmer-surface animate-shimmer rounded-xl', className)}
      aria-hidden
      style={style}
    />
  )
}

export function skeletonStagger(index: number, stepMs = 70, maxMs = 420) {
  return { animationDelay: `${Math.min(index * stepMs, maxMs)}ms` }
}

export function TrendCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'trend-card-skeleton-shell overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40',
        className,
      )}
      aria-hidden
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
        <div className="grid grid-cols-[auto_1fr_auto] gap-2">
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="size-11 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function TrendsGridSkeleton() {
  return (
    <div className="trend-feed mt-4 min-h-[520px]" aria-hidden aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="trend-feed-item animate-fade-in"
          style={skeletonStagger(i)}
        >
          <TrendCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function TrendFeedCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4 sm:p-[1.125rem]',
        className,
      )}
      aria-hidden
    >
      <div className="flex justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="mt-3 h-5 w-full" />
      <Skeleton className="mt-1.5 h-3 w-24" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Skeleton className="h-[3.25rem] rounded-lg" />
        <Skeleton className="h-[3.25rem] rounded-lg" />
        <Skeleton className="h-[3.25rem] rounded-lg" />
      </div>
    </div>
  )
}

function DashboardWidgetSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/35 p-4 sm:p-5" aria-hidden>
      <div className="mb-3.5 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 max-w-full" />
        </div>
        <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
      </div>
      <div className={cn('space-y-3', tall && 'min-h-[8.5rem]')}>
        <Skeleton className={cn('w-full rounded-xl', tall ? 'h-28' : 'h-16')} />
        {!tall && <Skeleton className="h-16 w-full rounded-xl" />}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div
      className="dashboard-os nex-os-polish mx-auto max-w-6xl flex flex-col gap-5 sm:gap-6"
      aria-busy="true"
      aria-label="Dashboard wird geladen"
    >
      <div
        className="relative overflow-hidden rounded-[var(--dash-radius-lg)] border border-violet-500/12 bg-zinc-900/40 p-4 sm:p-4"
        aria-hidden
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-44 max-w-full sm:h-8" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
        </div>
        <Skeleton className="mt-3 h-12 w-full rounded-[var(--dash-radius)]" />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--dash-radius)] border border-zinc-800/50 bg-zinc-950/50 p-2.5"
              style={skeletonStagger(i)}
            >
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="mt-2 h-2 w-16" />
              <Skeleton className="mt-1.5 h-6 w-12" />
              <Skeleton className="mt-1 h-2 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3" aria-hidden>
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="min-h-[5.75rem] rounded-[var(--dash-radius)]"
              style={skeletonStagger(i)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:gap-6" aria-hidden>
        <DashboardWidgetSkeleton tall />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <DashboardWidgetSkeleton />
          <DashboardWidgetSkeleton />
          <DashboardWidgetSkeleton />
          <DashboardWidgetSkeleton />
        </div>
      </div>

      <Skeleton className="h-24 w-full rounded-[var(--dash-radius-lg)]" aria-hidden />
    </div>
  )
}

export function VideoCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden" aria-hidden>
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-900/80">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950/90 to-transparent" />
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ToolPageSkeleton({ tool }: { tool?: DashboardToolId }) {
  if (tool === 'trend-intelligence') {
    return (
      <div className="trend-intelligence-page mx-auto max-w-6xl space-y-5" aria-hidden>
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
          ))}
        </div>
        <div className="ti-dashboard-skeleton rounded-2xl border border-violet-500/12 p-4">
          <Skeleton className="mb-4 h-6 w-48" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[4.25rem] rounded-2xl" />
            ))}
          </div>
        </div>
        <TrendsGridSkeleton />
      </div>
    )
  }

  if (tool === 'hook') {
    return (
      <div className="mx-auto max-w-4xl space-y-5" aria-hidden>
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="hook-results-feed hook-results-feed--skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="hook-skeleton-card p-4 sm:p-5" style={skeletonStagger(i)}>
              <div className="flex gap-3.5">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[88%]" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tool === 'ai-studio' || tool === 'my-videos') {
    return (
      <div className="mx-auto max-w-6xl space-y-8" aria-hidden>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="video-gen-placeholder rounded-2xl border border-violet-500/15 p-4 sm:p-6">
            <Skeleton className="aspect-[9/16] w-full max-w-xs mx-auto rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} style={skeletonStagger(i)}>
              <VideoCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-6" aria-hidden>
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
