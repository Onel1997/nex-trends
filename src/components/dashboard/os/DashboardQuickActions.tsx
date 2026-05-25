import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import {
  BoltIcon,
  ChartBarIcon,
  ClapperboardIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import type { DashboardRouteId } from '@/lib/routes'
import { cn } from '@/lib'

type DashboardQuickActionsProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

const ACTIONS = [
  {
    id: 'ai-studio' as const,
    title: 'Generate AI Video',
    subtitle: 'Cinematic shorts',
    icon: ClapperboardIcon,
    gradient: 'from-violet-600 via-violet-500 to-fuchsia-600',
  },
  {
    id: 'trend-intelligence' as const,
    title: 'Discover Trends',
    subtitle: 'Viral intelligence',
    icon: TrendingUpIcon,
    gradient: 'from-violet-600 to-indigo-600',
  },
  {
    id: 'analyzer' as const,
    title: 'Analyze Landing Page',
    subtitle: 'CRO insights',
    icon: ChartBarIcon,
    gradient: 'from-indigo-600 to-violet-600',
  },
  {
    id: 'hook' as const,
    title: 'Create Hooks',
    subtitle: 'Scroll-stoppers',
    icon: BoltIcon,
    gradient: 'from-fuchsia-600 to-violet-600',
  },
]

export function DashboardQuickActions({ onNavigate }: DashboardQuickActionsProps) {
  return (
    <section className="animate-fade-in animation-delay-100">
      <DashboardSectionHeading
        title="Quick Actions"
        description="Launch your highest-impact creator workflows instantly."
      />

      <div className="dashboard-os-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onNavigate(action.id)}
              className={cn(
                'dashboard-os-quick-action group min-w-[13rem] shrink-0 sm:min-w-0',
                'glass-premium flex items-center gap-4 rounded-2xl p-4 sm:p-5 text-left',
                'hover:border-violet-500/40',
                'active:scale-[0.98]',
                'animate-fade-in',
              )}
              style={{ animationDelay: `${120 + i * 50}ms` }}
            >
              <span
                className={cn(
                  'relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg sm:size-14',
                  action.gradient,
                  'shadow-violet-900/35 transition-smooth group-hover:scale-105 group-hover:shadow-violet-900/50',
                )}
              >
                <span
                  className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <Icon className="relative size-5 text-white sm:size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white sm:text-base">
                  {action.title}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">{action.subtitle}</span>
              </span>
              <span
                className="shrink-0 text-zinc-600 transition-smooth group-hover:translate-x-0.5 group-hover:text-violet-400"
                aria-hidden
              >
                →
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
