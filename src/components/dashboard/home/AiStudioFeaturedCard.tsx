import { ClapperboardIcon, SparklesIcon } from '@/components/ui/icons'
import { getRouteConfig } from '@/lib/routes'
import { cn } from '@/lib'

type AiStudioFeaturedCardProps = {
  onNavigate: () => void
}

export function AiStudioFeaturedCard({ onNavigate }: AiStudioFeaturedCardProps) {
  const route = getRouteConfig('ai-studio')

  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border text-left transition-smooth',
        'border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/40 via-zinc-950/85 to-zinc-950/90',
        'shadow-[0_10px_40px_-18px_rgba(217,70,239,0.35),inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        'hover:border-fuchsia-400/35 hover:shadow-[0_14px_48px_-14px_rgba(217,70,239,0.45)]',
        'active:scale-[0.995]',
      )}
    >
      <div
        className="pointer-events-none absolute -left-12 top-0 size-40 rounded-full bg-fuchsia-500/12 blur-3xl transition-smooth group-hover:bg-fuchsia-500/18"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-xl sm:size-14',
            'bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-fuchsia-900/35',
            'ring-2 ring-white/10 transition-smooth group-hover:scale-105',
          )}
        >
          <ClapperboardIcon className="size-6 text-white sm:size-7" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
              {route.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-200/90">
              <SparklesIcon className="size-3" aria-hidden />
              Core
            </span>
          </span>
          <span className="mt-1.5 block text-sm leading-relaxed text-zinc-400">
            {route.description}
          </span>
        </span>

        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl px-4 py-2.5 text-sm font-semibold sm:self-center',
            'bg-violet-600/90 text-white shadow-md shadow-violet-900/30',
            'transition-smooth group-hover:bg-violet-500',
          )}
        >
          Open Studio
          <span aria-hidden>→</span>
        </span>
      </div>
    </button>
  )
}
