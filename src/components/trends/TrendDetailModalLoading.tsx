import { createPortal } from 'react-dom'

/** Shown while TrendDetailModal chunk loads (Suspense fallback). */
export function TrendDetailModalLoading() {
  return createPortal(
    <div className="trend-detail-modal-root" aria-busy="true" aria-label="Analyse wird geladen">
      <div className="trend-detail-modal-overlay animate-fade-in" aria-hidden />
      <div className="trend-detail-modal-stage pointer-events-none">
        <div className="trend-detail-modal-sheet pointer-events-auto animate-sheet-up">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-700 sm:hidden" />
          <div className="space-y-4 p-5 sm:p-6">
            <div className="h-5 w-24 animate-shimmer rounded-full bg-zinc-800/80" />
            <div className="h-7 w-[80%] animate-shimmer rounded-lg bg-zinc-800/80" />
            <div className="h-4 w-full animate-shimmer rounded-lg bg-zinc-800/60" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-shimmer rounded-xl bg-zinc-800/50" />
              ))}
            </div>
            <div className="h-32 animate-shimmer rounded-xl bg-zinc-800/40" />
            <div className="h-24 animate-shimmer rounded-xl bg-zinc-800/40" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
