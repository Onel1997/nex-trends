import { DashboardCarousel, DashboardCarouselItem } from '@/components/dashboard/os/DashboardCarousel'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import { getDashboardQuickActions } from '@/components/dashboard/os/dashboard-modules'
import type { DashboardRouteId } from '@/lib/routes'
import { cn } from '@/lib'

type DashboardQuickActionsProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

const ACTIONS = getDashboardQuickActions()

export function DashboardQuickActions({ onNavigate }: DashboardQuickActionsProps) {
  return (
    <section className="dashboard-os-section animate-fade-in animation-delay-100">
      <DashboardSectionHeading
        title="Quick Actions"
        description="Launch your highest-impact creator workflows instantly."
      />

      <DashboardCarousel
        gridFrom="sm"
        gridClassName="sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
      >
        {ACTIONS.map((action, i) => {
          const Icon = action.icon
          return (
            <DashboardCarouselItem key={action.id} variant="action">
              <button
                type="button"
                onClick={() => onNavigate(action.id)}
                className={cn(
                  'dashboard-os-quick-action dashboard-os-card group box-border h-full w-full max-w-full min-w-0 text-left',
                  action.featured && 'dashboard-os-card--featured border-fuchsia-500/25',
                  'glass-premium flex items-center gap-3 rounded-2xl p-3.5 sm:gap-4 sm:p-5',
                  'hover:border-violet-500/40',
                  'active:scale-[0.98]',
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${120 + i * 50}ms` }}
              >
                <span
                  className={cn(
                    'relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-smooth group-hover:scale-105 sm:rounded-2xl',
                    action.featured ? 'size-11 sm:size-14' : 'size-10 sm:size-14',
                    action.gradient,
                    action.featured
                      ? 'shadow-fuchsia-900/45 ring-1 ring-fuchsia-400/30'
                      : 'shadow-violet-900/35 group-hover:shadow-violet-900/50',
                  )}
                >
                  <span
                    className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 sm:rounded-2xl"
                    aria-hidden
                  />
                  <Icon
                    className={cn(
                      'relative text-white',
                      action.featured ? 'size-5 sm:size-6' : 'size-4 sm:size-6',
                    )}
                    aria-hidden
                  />
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block truncate text-[13px] font-semibold leading-snug text-white sm:text-base">
                    {action.title}
                  </span>
                  <span className="dashboard-os-muted mt-0.5 block truncate text-[11px] leading-snug sm:text-xs">
                    {action.subtitle}
                  </span>
                </span>
                <span
                  className="shrink-0 text-zinc-500 transition-smooth group-hover:translate-x-0.5 group-hover:text-violet-400"
                  aria-hidden
                >
                  →
                </span>
              </button>
            </DashboardCarouselItem>
          )
        })}
      </DashboardCarousel>
    </section>
  )
}
