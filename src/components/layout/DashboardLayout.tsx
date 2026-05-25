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
    onSelectTool('dashboard')
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
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/55 backdrop-blur-[12px] transition-[opacity,backdrop-filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0 backdrop-blur-none',
        )}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(100%,17.5rem)]',
          'transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
          'lg:static lg:z-auto lg:w-[17.5rem] lg:translate-x-0 lg:transition-none lg:will-change-auto',
          mobileOpen
            ? 'translate-x-0 shadow-[4px_0_48px_-8px_rgba(0,0,0,0.65)]'
            : '-translate-x-full',
        )}
      >
        <Sidebar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          className="h-full lg:shadow-none"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-800/50 glass-subtle px-4 lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-xl text-zinc-300 transition-smooth hover:bg-zinc-800/60 hover:text-white active:scale-95"
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
            className="truncate text-sm font-semibold tracking-tight text-white"
          >
            {APP_NAME}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
