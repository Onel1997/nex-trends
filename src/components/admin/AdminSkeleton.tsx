import { cn } from '@/lib'

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-zinc-800/80 via-zinc-700/50 to-zinc-800/80',
        className,
      )}
    />
  )
}

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Analytics werden geladen">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-56" />
          <Bone className="h-4 w-80 max-w-full" />
        </div>
        <Bone className="h-10 w-64 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl border border-zinc-800/50 p-5"
          >
            <Bone className="mb-3 h-3 w-24" />
            <Bone className="h-9 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bone className="h-64 rounded-2xl" />
        <Bone className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

export function AdminTableSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl" aria-busy aria-label="Tabelle wird geladen">
      <div className="space-y-0 border-b border-zinc-800/60 px-4 py-3">
        <Bone className="h-3 w-full max-w-md" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-zinc-800/40 px-4 py-4"
        >
          <Bone className="h-4 flex-1" />
          <Bone className="h-4 w-12" />
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function AdminTrendSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>
        <Bone className="h-10 w-64 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Bone className="h-16 rounded-2xl" />
        <Bone className="h-16 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bone className="h-56 rounded-2xl" />
        <Bone className="h-56 rounded-2xl" />
      </div>
      <Bone className="h-72 rounded-2xl" />
    </div>
  )
}

export function AdminControlsSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <Bone className="h-8 w-40" />
      <Bone className="h-40 rounded-2xl" />
      <Bone className="h-32 rounded-2xl" />
      <Bone className="h-48 rounded-2xl" />
    </div>
  )
}
