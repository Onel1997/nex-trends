import type { DashboardRouteConfig } from '@/lib/routes'
import { cn } from '@/lib'

type FeatureNavCardProps = {
  route: DashboardRouteConfig
  onNavigate: (id: DashboardRouteConfig['id']) => void
  variant?: 'default' | 'compact'
}

export function FeatureNavCard({
  route,
  onNavigate,
  variant = 'default',
}: FeatureNavCardProps) {
  const { id, label, description, Icon } = route

  return (
    <button
      type="button"
      onClick={() => onNavigate(id)}
      className={cn(
        'group flex w-full items-start gap-3 rounded-xl border text-left transition-smooth',
        'border-zinc-800/50 bg-zinc-950/40',
        'hover:border-violet-500/25 hover:bg-violet-500/5',
        'active:scale-[0.99]',
        variant === 'compact' ? 'p-3' : 'p-4',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/12 to-fuchsia-500/8 ring-1 ring-violet-500/15 transition-smooth group-hover:from-violet-500/18',
          variant === 'compact' ? 'size-9' : 'size-10',
        )}
      >
        <Icon
          className={cn('text-violet-400', variant === 'compact' ? 'size-4' : 'size-[18px]')}
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{description}</span>
      </span>
      <span
        className="shrink-0 text-zinc-600 transition-smooth group-hover:text-violet-400/80"
        aria-hidden
      >
        →
      </span>
    </button>
  )
}
