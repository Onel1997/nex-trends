import { CrownIcon, ToolIcon } from '@/components/ui/icons'
import { CreditsCard } from '@/components/subscription/UsageLimitBar'
import { APP_NAME, type DashboardToolId } from '@/lib'
import { cn } from '@/lib'
import { navigateToHome } from '@/lib/navigation'
import { getSidebarRoutes } from '@/lib/routes'
import { useSubscription } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'

type SidebarProps = {
  activeTool: DashboardToolId
  onSelectTool: (id: DashboardToolId) => void
  className?: string
}

export function Sidebar({ activeTool, onSelectTool, className }: SidebarProps) {
  const { hasProAccess, openStripeCheckout } = useSubscription()
  const navItems = getSidebarRoutes()

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl',
        className,
      )}
    >
      <div className="border-b border-zinc-800/50 px-4 py-4 lg:px-5 lg:py-5">
        <button
          type="button"
          onClick={() => {
            navigateToHome()
            onSelectTool('dashboard')
          }}
          className="group flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-smooth hover:bg-white/[0.03]"
          aria-label={`${APP_NAME} Home`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl gradient-accent text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition-smooth group-hover:scale-105">
            NT
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-white">
              {APP_NAME}
            </span>
            <span className="block truncate text-xs text-zinc-500">Marketing AI Suite</span>
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 lg:px-4 lg:py-5" aria-label="Navigation">
        <p className="mb-2.5 px-2.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map((route) => {
            const isActive = activeTool === route.id
            const isCore = route.isCoreFeature

            return (
              <li key={route.id}>
                <button
                  type="button"
                  onClick={() => onSelectTool(route.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-smooth',
                    isActive
                      ? isCore
                        ? 'bg-violet-500/15 text-violet-100 ring-1 ring-inset ring-violet-500/35'
                        : 'bg-violet-500/10 text-violet-100 ring-1 ring-inset ring-violet-500/25'
                      : isCore
                        ? 'text-zinc-300 hover:bg-violet-500/8 hover:text-white'
                        : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100',
                  )}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-400"
                      aria-hidden
                    />
                  )}
                  <ToolIcon
                    toolId={route.id}
                    className={cn(
                      'size-[18px] shrink-0',
                      isActive || isCore
                        ? 'text-violet-400'
                        : 'text-zinc-500 group-hover:text-violet-400/70',
                    )}
                  />
                  <span className="min-w-0 flex-1 leading-snug font-medium">{route.label}</span>
                  {isCore && !isActive && (
                    <span className="shrink-0 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-300/90">
                      Core
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-2.5 border-t border-zinc-800/50 p-4 lg:p-5">
        <CreditsCard compact />

        {!hasProAccess && (
          <button
            type="button"
            onClick={() => void openStripeCheckout()}
            className={cn(
              'group relative w-full overflow-hidden rounded-xl p-px transition-smooth',
              'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500',
              'shadow-[0_0_24px_-8px_rgba(217,70,239,0.5)]',
              'active:scale-[0.98]',
            )}
          >
            <span className="flex w-full items-center justify-center gap-2 rounded-[11px] gradient-accent px-4 py-2.5 text-sm font-bold text-white">
              <CrownIcon className="size-4" aria-hidden />
              Upgrade to Pro
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="w-full rounded-xl py-2 text-sm font-medium text-zinc-500 transition-smooth hover:bg-zinc-900/60 hover:text-red-400"
        >
          Abmelden
        </button>
      </div>
    </aside>
  )
}
