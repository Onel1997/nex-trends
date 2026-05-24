import { useEffect, useState, type ReactNode } from 'react'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'
import { APP_NAME, type DashboardToolId } from '@/lib'
import { cn } from '@/lib'
import { navigateToHome } from '@/lib/navigation'
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
    onSelectTool('trends')
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-svh bg-zinc-950 text-zinc-100">
      <button
        type="button"
        aria-label="Menü schließen"
        onClick={() => setMobileOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:transition-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          className="shadow-2xl shadow-black/50 lg:shadow-none"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-900"
          >
            {mobileOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleNavigateHome}
            className="truncate text-sm font-semibold text-white"
          >
            {APP_NAME}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
