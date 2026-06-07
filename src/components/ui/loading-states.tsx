import { cn } from '@/lib'
import { Skeleton } from '@/components/ui/Skeleton'

export function skeletonStagger(index: number, stepMs = 70, maxMs = 420) {
  return { animationDelay: `${Math.min(index * stepMs, maxMs)}ms` }
}

/** Full-screen bootstrap while the SPA hydrates */
export function AppBootstrapSkeleton({ label = 'NexTrends wird geladen …' }: { label?: string }) {
  return (
    <div
      className="flex min-h-svh w-full flex-col items-center justify-center bg-zinc-950 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
        <p className="text-center text-xs font-medium text-zinc-600">{label}</p>
      </div>
    </div>
  )
}

/** Auth / callback holding screen */
export function AuthPanelSkeleton({
  title = 'Anmeldung wird vorbereitet …',
  subtitle = 'Einen Moment — du wirst gleich weitergeleitet.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-zinc-950 px-4">
      <div
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-8 py-10 text-center shadow-2xl shadow-violet-950/20"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Skeleton className="mb-6 size-16 rounded-2xl" />
        <p className="text-base font-semibold tracking-tight text-white">{title}</p>
        <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        <div className="mt-8 flex w-full gap-2" aria-hidden>
          <Skeleton className="h-1 flex-1 rounded-full" />
          <Skeleton className="h-1 flex-1 rounded-full" />
          <Skeleton className="h-1 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** 9:16 video frame + blueprint lines — AI Video Studio generation */
export function VideoGenerationPlaceholder({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn('video-gen-placeholder w-full', className)}
      aria-hidden
    >
      <div
        className={cn(
          'video-gen-placeholder__frame relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/80',
          compact ? 'aspect-[9/14] max-h-[220px]' : 'aspect-[9/16] w-full',
        )}
      >
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-x-0 top-0 flex gap-2 p-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-3 pt-10">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="size-14 rounded-full opacity-80" />
        </div>
      </div>
      {!compact && (
        <div className="mt-4 space-y-2.5">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-[92%] rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}

/** Single hook result — matches HookCard layout */
export function HookResultSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="hook-skeleton-card nex-shimmer-surface p-4 sm:p-5"
      style={skeletonStagger(index)}
    >
      <div className="flex gap-3.5 sm:gap-4">
        <Skeleton className="size-10 shrink-0 rounded-xl sm:size-9" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-[92%] rounded-lg" />
          <Skeleton className="h-4 w-[78%] rounded-lg sm:hidden" />
          <div className="flex flex-wrap gap-2 pt-0.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-[4.5rem] rounded-md" />
          </div>
        </div>
        <div className="hidden shrink-0 flex-col gap-1.5 sm:flex">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>
      <div className="mt-3 flex gap-2 sm:hidden">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export function HookGeneratingSkeleton({ count = 10 }: { count?: number }) {
  const visible = Math.min(count, 6)

  return (
    <div
      className="hook-results-feed hook-results-feed--skeleton"
      aria-busy="true"
      aria-label="Hooks werden generiert"
    >
      {Array.from({ length: visible }).map((_, i) => (
        <HookResultSkeleton key={i} index={i} />
      ))}
      <p className="text-center text-xs font-medium text-violet-400/85 animate-pulse-soft">
        AI generiert Scroll-Stopper …
      </p>
    </div>
  )
}

/** Intelligence overview strip above the trend feed */
export function TrendIntelligenceDashboardSkeleton() {
  return (
    <div
      className="ti-dashboard-skeleton ti-dashboard--compact space-y-2.5 rounded-2xl border border-violet-500/15 bg-gradient-to-b from-violet-500/[0.06] via-zinc-950/40 to-zinc-950/20 p-3 sm:p-4"
      aria-hidden
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-44 max-w-full" />
        </div>
        <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" style={skeletonStagger(i)} />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1 rounded-lg" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="rounded-lg border border-zinc-800/40 p-2">
          <Skeleton className="mb-2 h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="mb-1 h-9 w-full rounded-md last:mb-0"
              style={skeletonStagger(section * 5 + i, 40)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SubscriptionPanelSkeleton({
  label = 'Lade dein Abo …',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-[320px] flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/35 p-5 sm:p-6',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-2/3 max-w-xs" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <p className="text-center text-xs text-zinc-600">{label}</p>
    </div>
  )
}

export function AdminPanelSkeleton({ label = 'Admin-Daten werden geladen …' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[280px] flex-col gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" style={skeletonStagger(i)} />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
      <p className="text-center text-xs text-zinc-600">{label}</p>
    </div>
  )
}
