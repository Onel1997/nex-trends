import { useState } from 'react'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { LogOutIcon, ToolIcon } from '@/components/ui/icons'
import { PlanBadge } from '@/components/billing/PlanBadge'
import { SidebarCreditsCard } from '@/components/subscription/SidebarCreditsCard'
import { useToast } from '@/context/ToastContext'
import { APP_NAME, type DashboardToolId } from '@/lib'
import { cn } from '@/lib'
import { getUserAvatarUrl, getUserDisplayName } from '@/lib/auth/profile'
import { navigateToTool } from '@/lib/navigation'
import { getRouteConfig } from '@/lib/routes'
import { SIDEBAR_LIBRARY_ROUTES, SIDEBAR_SECTIONS } from '@/lib/sidebar-navigation'
import { navigateToAdmin } from '@/lib/admin-navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'

type SidebarProps = {
  activeTool: DashboardToolId
  onSelectTool: (id: DashboardToolId) => void
  className?: string
}

function SidebarSectionLabel({
  children,
  variant = 'default',
}: {
  children: string
  variant?: 'default' | 'library'
}) {
  return (
    <p
      className={cn(
        'px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
        variant === 'library' ? 'text-zinc-500' : 'text-zinc-600',
      )}
    >
      {children}
    </p>
  )
}

function SidebarDivider({ variant = 'default' }: { variant?: 'default' | 'library' }) {
  if (variant === 'library') {
    return (
      <div className="mx-2 my-4 px-1" aria-hidden>
        <div className="h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
        <div className="mt-px h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>
    )
  }
  return (
    <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-zinc-800/70 to-transparent" />
  )
}

/** Active route indicator — only shown on the current page */
function SidebarActiveDot() {
  return (
    <span
      className="relative flex size-2 shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-violet-500/50 blur-[3px]" />
      <span className="relative size-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_1px_rgba(139,92,246,0.65)]" />
    </span>
  )
}

type NavItemProps = {
  routeId: DashboardToolId
  isActive: boolean
  isLibrary: boolean
  onSelect: () => void
}

function SidebarNavItem({ routeId, isActive, isLibrary, onSelect }: NavItemProps) {
  const route = getRouteConfig(routeId)

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-smooth',
          'active:scale-[0.98]',
          isActive && 'sidebar-nav-item--active font-medium text-white',
          !isActive && 'hover:translate-x-px',
          !isActive &&
            isLibrary &&
            'font-normal text-zinc-500 hover:bg-zinc-800/25 hover:text-zinc-200',
          !isActive &&
            !isLibrary &&
            'font-normal text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100',
        )}
      >
        <ToolIcon
          toolId={routeId}
          className={cn(
            'size-[17px] shrink-0 transition-smooth',
            isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300',
          )}
        />
        <span className="min-w-0 flex-1 truncate leading-snug tracking-tight">
          {route.label}
        </span>
        {isActive ? <SidebarActiveDot /> : null}
      </button>
    </li>
  )
}

export function Sidebar({ activeTool, onSelectTool, className }: SidebarProps) {
  const { isAdmin, session, userPlan, hasProAccess } = useSubscription()
  const { showToast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const user = session?.user ?? null
  const displayName = user ? getUserDisplayName(user) : null
  const avatarUrl = user ? getUserAvatarUrl(user) : null
  const email = user?.email ?? null

  const handleLogout = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      showToast({
        type: 'error',
        title: 'Abmelden fehlgeschlagen',
        message: error.message,
        durationMs: 6000,
      })
      setIsSigningOut(false)
      return
    }

    window.location.replace('/')
  }

  return (
    <aside
      className={cn('sidebar-panel flex h-full min-h-0 w-full flex-col overflow-hidden', className)}
    >
      {/* Brand */}
      <div className="shrink-0 px-4 pb-2 pt-5">
        <button
          type="button"
          onClick={() => onSelectTool('dashboard')}
          className="group flex w-full items-center gap-3 rounded-xl p-1 text-left transition-smooth hover:bg-white/[0.02] active:scale-[0.99]"
          aria-label={`${APP_NAME} Home`}
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl gradient-accent text-sm font-bold text-white shadow-lg shadow-violet-900/25 transition-smooth group-hover:shadow-violet-900/40">
            NT
            <span
              className="sidebar-online-dot absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500"
              title="Online"
              aria-hidden
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold tracking-tight text-white">
              {APP_NAME}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-zinc-500">
              Marketing AI Suite
            </span>
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 scrollbar-thin"
        aria-label="Main navigation"
      >
        {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={cn(
              sectionIndex > 0 && 'mt-2',
              section.id === 'library' && 'rounded-xl bg-zinc-900/25 px-1 py-1.5',
            )}
          >
            <SidebarSectionLabel variant={section.id === 'library' ? 'library' : 'default'}>
              {section.label}
            </SidebarSectionLabel>
            <ul className="space-y-1 px-0.5">
              {section.routes.map((routeId) => (
                <SidebarNavItem
                  key={routeId}
                  routeId={routeId}
                  isActive={activeTool === routeId}
                  isLibrary={SIDEBAR_LIBRARY_ROUTES.includes(routeId)}
                  onSelect={() => onSelectTool(routeId)}
                />
              ))}
              {section.id === 'system' && (
                <li>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isSigningOut}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-normal text-zinc-500 transition-smooth',
                      'hover:bg-red-500/[0.06] hover:text-red-300/90 active:scale-[0.98] disabled:opacity-50',
                    )}
                  >
                    <LogOutIcon className="size-[17px] shrink-0 text-zinc-600 group-hover:text-red-400/80" />
                    <span className="truncate tracking-tight">
                      {isSigningOut ? 'Abmelden …' : 'Logout'}
                    </span>
                  </button>
                </li>
              )}
            </ul>
            {section.dividerAfter ? (
              <SidebarDivider variant={section.dividerAfter} />
            ) : sectionIndex < SIDEBAR_SECTIONS.length - 1 ? (
              <SidebarDivider />
            ) : null}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-3 border-t border-white/[0.04] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {displayName && (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-zinc-900/40 px-3 py-2.5">
            <UserAvatar name={displayName} avatarUrl={avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-[13px] font-medium text-white">{displayName}</p>
                <PlanBadge
                  plan={isAdmin ? 'founder' : userPlan}
                  className="shrink-0 px-1.5 py-px text-[8px]"
                />
              </div>
              {email ? (
                <p className="truncate text-[11px] text-zinc-500">{email}</p>
              ) : null}
              {hasProAccess && !isAdmin ? (
                <p className="mt-0.5 text-[10px] font-medium text-violet-400/80">Pro aktiv</p>
              ) : null}
            </div>
          </div>
        )}

        <SidebarCreditsCard onUpgrade={() => navigateToTool('pricing')} />

        {isAdmin && (
          <button
            type="button"
            onClick={() => navigateToAdmin()}
            className="w-full rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[11px] font-semibold text-amber-200/90 transition-smooth hover:bg-amber-500/10"
          >
            Admin Dashboard
          </button>
        )}

        <p className="px-1 text-center text-[10px] font-medium tracking-wide text-zinc-600">
          Powered by{' '}
          <span className="text-zinc-500">{APP_NAME} AI</span>
        </p>
      </div>
    </aside>
  )
}
