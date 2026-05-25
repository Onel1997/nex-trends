import { Badge } from '@/components/ui/Badge'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'
import { APP_NAME } from '@/lib'
import { cn } from '@/lib'
import { navigateFromAdminToDashboard } from '@/lib/admin-navigation'
import type { AdminSection } from '@/types/admin'

const NAV: { id: AdminSection; label: string }[] = [
  { id: 'overview', label: 'Analytics' },
  { id: 'users', label: 'Users' },
  { id: 'trends', label: 'Trends' },
  { id: 'controls', label: 'Controls' },
]

type AdminSidebarProps = {
  active: AdminSection
  onSelect: (section: AdminSection) => void
  className?: string
}

export function AdminSidebar({ active, onSelect, className }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl',
        className,
      )}
    >
      <div className="border-b border-zinc-800/50 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-white">{APP_NAME}</span>
          <Badge variant="admin">ADMIN</Badge>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Control Center</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
        {NAV.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-smooth',
                isActive
                  ? 'bg-violet-500/15 text-violet-100 ring-1 ring-inset ring-violet-500/35'
                  : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-zinc-800/50 p-4">
        <button
          type="button"
          onClick={navigateFromAdminToDashboard}
          className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-300 transition-smooth hover:border-zinc-700 hover:text-white"
        >
          ← Zur App
        </button>
      </div>
    </aside>
  )
}

type AdminMobileHeaderProps = {
  open: boolean
  onToggle: () => void
}

export function AdminMobileHeader({ open, onToggle }: AdminMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-800/50 glass-subtle px-4 lg:hidden">
      <button
        type="button"
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        onClick={onToggle}
        className="flex size-10 items-center justify-center rounded-xl text-zinc-300 hover:bg-zinc-800/60"
      >
        {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>
      <span className="text-sm font-semibold text-white">Admin Dashboard</span>
      <Badge variant="admin" className="ml-auto">
        ADMIN
      </Badge>
    </header>
  )
}
