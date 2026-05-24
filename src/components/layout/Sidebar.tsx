import { Badge } from '@/components/ui/Badge'
import { CrownIcon, ToolIcon } from '@/components/ui/icons'
import { CreditsCard } from '@/components/subscription/UsageLimitBar'
import {
  APP_NAME,
  PRO_PRICE_LABEL,
  SIDEBAR_ITEMS,
  isPremiumTool,
  type DashboardToolId,
} from '@/lib'
import { cn } from '@/lib'
import { navigateToHome } from '@/lib/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'

type SidebarProps = {
  activeTool: DashboardToolId
  onSelectTool: (id: DashboardToolId) => void
  className?: string
}

export function Sidebar({ activeTool, onSelectTool, className }: SidebarProps) {
  const { hasProAccess, openStripeCheckout } = useSubscription()

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-zinc-800/80 bg-zinc-950',
        className,
      )}
    >
      <div className="border-b border-zinc-800/80 px-4 py-5 lg:px-5">
        <button
          type="button"
          onClick={() => {
            navigateToHome()
            onSelectTool('trends')
          }}
          className="group flex w-full items-center gap-3 rounded-xl p-1 text-left transition-all duration-200 hover:bg-violet-500/5"
          aria-label={`${APP_NAME} Home`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition-transform group-hover:scale-105">
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

      <nav className="flex-1 overflow-y-auto px-3 py-5 lg:px-4" aria-label="Navigation">
        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Werkzeuge
        </p>
        <ul className="space-y-1.5">
          {SIDEBAR_ITEMS.map((tool) => {
            const isActive = activeTool === tool.id
            const isPremium = isPremiumTool(tool.id)

            return (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => onSelectTool(tool.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200',
                    isActive
                      ? 'bg-violet-600/15 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-inset ring-violet-500/35'
                      : 'text-zinc-400 hover:bg-violet-500/8 hover:text-zinc-100 hover:ring-1 hover:ring-inset hover:ring-violet-500/15',
                  )}
                >
                  <ToolIcon
                    toolId={tool.id}
                    className={cn(
                      'size-5 shrink-0 transition-colors',
                      isActive
                        ? 'text-violet-400'
                        : 'text-zinc-500 group-hover:text-violet-400/80',
                    )}
                  />
                  <span className="flex-1 leading-snug">{tool.label}</span>
                  {isPremium && !hasProAccess && (
                    <Badge variant="pro" className="px-1.5 py-0 text-[10px]">
                      Pro
                    </Badge>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-4 border-t border-zinc-800/80 p-4 lg:p-5">
        <CreditsCard compact />

        {!hasProAccess && (
          <button
            type="button"
            onClick={() => void openStripeCheckout()}
            className={cn(
              'group relative w-full overflow-hidden rounded-xl p-px',
              'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500',
              'shadow-[0_0_28px_-6px_rgba(217,70,239,0.55)] transition-all duration-300',
              'hover:shadow-[0_0_36px_-4px_rgba(217,70,239,0.65)] hover:scale-[1.02]',
            )}
          >
            <span className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white transition-all group-hover:from-violet-500 group-hover:to-fuchsia-500">
              <CrownIcon className="size-4" aria-hidden />
              Upgrade to Pro
              <span className="hidden text-violet-200/90 sm:inline">· {PRO_PRICE_LABEL}</span>
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="w-full rounded-lg py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-900/60 hover:text-red-400"
        >
          Abmelden
        </button>
      </div>
    </aside>
  )
}
