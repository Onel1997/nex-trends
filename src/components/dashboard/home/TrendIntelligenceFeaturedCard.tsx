import { SparklesIcon, TrendingUpIcon } from '@/components/ui/icons'
import { getRouteConfig } from '@/lib/routes'
import { cn } from '@/lib'

type TrendIntelligenceFeaturedCardProps = {
  onNavigate: () => void
}

export function TrendIntelligenceFeaturedCard({ onNavigate }: TrendIntelligenceFeaturedCardProps) {
  const route = getRouteConfig('trend-intelligence')

  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border text-left transition-smooth',
        'border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-zinc-950/80 to-zinc-950/90',
        'shadow-[0_12px_48px_-16px_rgba(139,92,246,0.35),inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        'hover:border-violet-400/40 hover:shadow-[0_16px_56px_-12px_rgba(139,92,246,0.45)]',
        'active:scale-[0.995]',
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-violet-500/15 blur-3xl transition-smooth group-hover:bg-violet-500/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-1/4 size-32 rounded-full bg-fuchsia-500/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6 lg:p-7">
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-2xl sm:size-16',
            'bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/40',
            'ring-2 ring-white/10 transition-smooth group-hover:scale-105',
          )}
        >
          <TrendingUpIcon className="size-7 text-white sm:size-8" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
            <SparklesIcon className="size-3" aria-hidden />
            Core Product
          </span>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {route.label}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">
            {route.description} — Viral Feed, AI Insights, Hook Generator & Trend Search in einem
            Research-Studio.
          </p>
        </div>

        <span
          className={cn(
            'nex-btn nex-btn--primary inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold sm:self-center',
          )}
        >
          Öffnen
          <span aria-hidden>→</span>
        </span>
      </div>
    </button>
  )
}
