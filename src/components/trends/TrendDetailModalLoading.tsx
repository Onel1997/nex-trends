import { createPortal } from 'react-dom'
import { Skeleton } from '@/components/ui/Skeleton'

/** Shown while TrendDetailModal chunk loads (Suspense fallback). */
export function TrendDetailModalLoading() {
  return createPortal(
    <div className="trend-detail-modal-root" aria-busy="true" aria-label="Analyse wird geladen">
      <div className="trend-detail-modal-overlay animate-fade-in" aria-hidden />
      <div className="trend-detail-modal-stage pointer-events-none">
        <div className="trend-detail-modal-sheet pointer-events-auto animate-sheet-up">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-700 sm:hidden" />
          <div className="space-y-4 p-5 sm:p-6">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-7 w-[80%]" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
