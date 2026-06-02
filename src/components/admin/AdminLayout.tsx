import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib'
import { AdminMobileHeader, AdminSidebar } from '@/components/admin/AdminSidebar'
import type { AdminSection } from '@/types/admin'

type AdminLayoutProps = {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  children: ReactNode
}

export function AdminLayout({
  activeSection,
  onSectionChange,
  children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="admin-shell relative flex min-h-svh bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.18),transparent)]"
        aria-hidden
      />

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Menü schließen"
          onClick={() => setMobileOpen(false)}
          className="mobile-drawer-backdrop fixed inset-0 z-40 bg-black/70 backdrop-blur-md opacity-100 transition-opacity lg:hidden"
        />
      ) : null}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <AdminSidebar
          active={activeSection}
          onSelect={(s) => {
            onSectionChange(s)
            setMobileOpen(false)
          }}
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <AdminMobileHeader open={mobileOpen} onToggle={() => setMobileOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
