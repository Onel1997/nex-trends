import { memo } from 'react'
import { DashboardCarousel, DashboardCarouselItem } from '@/components/dashboard/os/DashboardCarousel'
import { DashboardSectionHeading } from '@/components/dashboard/os/DashboardSectionHeading'
import {
  BoltIcon,
  BookmarkIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@/components/ui/icons'
import type { DashboardRouteId } from '@/lib/routes'
import { cn } from '@/lib'

type DashboardQuickActionsProps = {
  onNavigate: (tool: DashboardRouteId) => void
}

const QUICK_ACTIONS = [
  {
    id: 'hook' as const,
    label: 'Generate Hooks',
    description: 'Scroll-stopping hooks in seconds',
    icon: BoltIcon,
    accent: 'from-violet-600/20 to-fuchsia-600/10',
  },
  {
    id: 'saved-trends' as const,
    label: 'Saved Hooks',
    description: 'Your hook library & favorites',
    icon: BookmarkIcon,
    accent: 'from-indigo-600/20 to-violet-600/10',
  },
  {
    id: 'ad-copy' as const,
    label: 'AI Ad Copy',
    description: 'Headlines & CTAs for paid ads',
    icon: SparklesIcon,
    accent: 'from-fuchsia-600/15 to-violet-600/10',
  },
  {
    id: 'analyzer' as const,
    label: 'Landing Analyzer',
    description: 'Conversion insights for pages',
    icon: ChartBarIcon,
    accent: 'from-cyan-600/12 to-violet-600/10',
  },
] as const

function QuickActionButton({
  action,
  onNavigate,
}: {
  action: (typeof QUICK_ACTIONS)[number]
  onNavigate: (tool: DashboardRouteId) => void
}) {
  const Icon = action.icon
  return (
    <button
      type="button"
      onClick={() => onNavigate(action.id)}
      className={cn(
        'dashboard-os-quick-action nex-card-interactive group relative h-full w-full overflow-hidden text-left',
        'rounded-[var(--dash-radius)] border border-zinc-800/55 bg-zinc-950/50 p-3.5 sm:p-4',
        'min-h-[5.75rem] touch-manipulation',
      )}
    >
      <div
        className={cn(
          'dashboard-os-quick-action__gradient pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br opacity-80',
          action.accent,
        )}
        aria-hidden
      />
      <div className="dashboard-os-quick-action__glow pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
      <div className="relative flex min-h-[4.75rem] flex-col sm:min-h-[5rem]">
        <span className="flex size-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300 transition-smooth group-hover:border-violet-500/35 group-hover:bg-violet-500/15">
          <Icon className="size-4" aria-hidden />
        </span>
        <p className="mt-2.5 text-[12px] font-semibold leading-snug tracking-tight text-white sm:text-[13px]">
          {action.label}
        </p>
        <p className="mt-0.5 line-clamp-2 flex-1 text-[10px] leading-snug text-zinc-500">
          {action.description}
        </p>
        <span className="mt-2 text-[10px] font-medium text-violet-400/90 transition-smooth group-hover:text-violet-300">
          Open →
        </span>
      </div>
    </button>
  )
}

function DashboardQuickActionsInner({ onNavigate }: DashboardQuickActionsProps) {
  return (
    <section className="dashboard-os-section dashboard-os-quick-actions">
      <DashboardSectionHeading
        title="Quick Actions"
        description="Jump straight into your most-used AI tools."
        compact
      />

      <DashboardCarousel className="dashboard-os-quick-actions__carousel -mx-0.5 sm:hidden">
        {QUICK_ACTIONS.map((action) => (
          <DashboardCarouselItem key={action.id} variant="action">
            <QuickActionButton action={action} onNavigate={onNavigate} />
          </DashboardCarouselItem>
        ))}
      </DashboardCarousel>

      <div className="dashboard-os-quick-actions__grid">
        {QUICK_ACTIONS.map((action) => (
          <QuickActionButton key={action.id} action={action} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  )
}

export const DashboardQuickActions = memo(DashboardQuickActionsInner)
