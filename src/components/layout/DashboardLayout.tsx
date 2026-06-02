import { useEffect, useState, type ReactNode } from 'react'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'
import { APP_NAME, type DashboardToolId } from '@/lib'
import { cn } from '@/lib'
import {
  clearDashboardBodyScrollLock,
  setDashboardBodyScrollLocked,
  setDashboardRouteActive,
} from '@/lib/dashboard-scroll-lock'
import { navigateToHome } from '@/lib/navigation'
import { MobileBottomNav } from './mobile-bottom-nav'
import { Sidebar } from './Sidebar'

type DashboardLayoutProps = {
  children: ReactNode
  activeTool: DashboardToolId
  onSelectTool: (id: DashboardToolId) => void
}

export function DashboardLayout({
  children,
  activeTool,
  onSelectTool,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSelectTool = (id: DashboardToolId) => {
    onSelectTool(id)
    setMobileOpen(false)
  }

  const handleNavigateHome = () => {
    navigateToHome()
    onSelectTool('dashboard')
    setMobileOpen(false)
  }

  useEffect(() => {
    setDashboardRouteActive(true)
    return () => {
      setDashboardRouteActive(false)
      clearDashboardBodyScrollLock()
    }
  }, [])

  useEffect(() => {
    setDashboardBodyScrollLocked(mobileOpen)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <div className="dashboard-shell dashboard-shell--mobile-nav flex min-h-dvh overflow-x-hidden bg-zinc-950 text-zinc-100">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Menü schließen"
          onClick={() => setMobileOpen(false)}
          className="mobile-drawer-backdrop fixed inset-0 z-40 bg-black/40 opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden"
        />
      ) : null}

      <div
        className={cn(
          'mobile-sidebar-drawer fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[20rem]',
          'transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'lg:relative lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:max-h-dvh lg:w-[17.5rem] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:self-start lg:transition-none',
          mobileOpen
            ? 'translate-x-0 shadow-[4px_0_40px_-8px_rgba(0,0,0,0.5)]'
            : '-translate-x-full',
        )}
      >
        <Sidebar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          className="h-full min-h-0 lg:shadow-none"
        />
      </div>

      <div className="dashboard-shell__column flex min-w-0 min-h-0 flex-1 flex-col">
        <header className="dashboard-mobile-header sticky-header-smooth sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-800/50 glass-subtle lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="nex-touch-target flex size-11 shrink-0 items-center justify-center rounded-xl text-zinc-300 transition-smooth hover:bg-zinc-800/60 hover:text-white active:scale-[0.96]"
          >
            {mobileOpen ? (
              <CloseIcon className="size-[1.125rem]" />
            ) : (
              <MenuIcon className="size-[1.125rem]" />
            )}
          </button>
          <button
            type="button"
            onClick={handleNavigateHome}
            className="nex-touch-target -ml-1 min-h-11 min-w-0 flex-1 truncate px-2 text-left text-sm font-semibold tracking-tight text-white active:opacity-80"
          >
            {APP_NAME}
          </button>
        </header>

        <main className="dashboard-main-safe dashboard-main-with-mobile-nav dashboard-mobile-scroll-root min-w-0">
          {children}
        </main>
      </div>

      <MobileBottomNav activeTool={activeTool} onSelectTool={handleSelectTool} />
    </div>
  )
}
