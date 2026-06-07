import { useVideoGenerationHistory } from '@/hooks/useVideoGenerationHistory'
import { cn } from '@/lib'
import { Skeleton } from '@/components/ui/Skeleton'

type VideoGenerationHistoryProps = {
  onSelect?: (videoUrl: string, posterUrl?: string) => void
  className?: string
}

export function VideoGenerationHistory({
  onSelect,
  className,
}: VideoGenerationHistoryProps) {
  const { items, loading, error, refresh } = useVideoGenerationHistory()

  if (loading && items.length === 0) {
    return (
      <div className={cn('space-y-3 py-2', className)} aria-busy="true" aria-label="Verlauf wird geladen">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-zinc-800/50 p-3">
            <Skeleton className="aspect-[9/14] w-14 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <p className={cn('text-sm text-zinc-500', className)}>
        {error}
      </p>
    )
  }

  if (items.length === 0) return null

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Deine AI Videos
        </h3>
        <button
          type="button"
          onClick={() => void refresh()}
          className="text-[10px] text-zinc-500 transition hover:text-zinc-300"
        >
          Aktualisieren
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const ready = item.status === 'completed' && item.videoUrl
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  if (ready && item.videoUrl) {
                    onSelect?.(item.videoUrl, item.posterUrl)
                  }
                }}
                className={cn(
                  'group relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/50 text-left transition',
                  ready && 'hover:border-violet-500/40',
                  !ready && 'opacity-60',
                )}
              >
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-zinc-900 text-[10px] text-zinc-600">
                    {item.status}
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2 text-[10px] font-medium text-white line-clamp-2">
                  {item.hookText?.slice(0, 48) ?? 'AI Video'}
                </span>
                {item.provider && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/50 px-1 py-0.5 text-[9px] uppercase text-zinc-400">
                    {item.provider}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
