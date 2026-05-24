import { useState } from 'react'
import { APP_NAME, cn } from '@/lib'
import { scrollToSection } from '@/lib/scroll'
import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'social-proof', label: 'Erfolge' },
  { id: 'pricing', label: 'Preise' },
] as const

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleNav(id: string) {
    setMobileOpen(false)
    scrollToSection(id)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
          aria-label={`${APP_NAME} Startseite`}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-black text-white">
            NT
          </span>
          {APP_NAME}
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Hauptnavigation">
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleNav(id)}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNav('login')}
            className="hidden rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-200 transition-all hover:border-violet-500/50 hover:bg-zinc-800 hover:text-white sm:inline-flex"
          >
            Anmelden
          </button>
          <GoogleSignInButton
            label="Starten"
            size="md"
            className="hidden sm:inline-flex !w-auto !min-h-10 !px-5 !py-2 !text-sm"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 md:hidden',
              mobileOpen && 'border-violet-500/40 bg-zinc-900',
            )}
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-zinc-800/60 bg-black/95 px-4 py-4 md:hidden"
          aria-label="Mobile Navigation"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => handleNav(id)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  {label}
                </button>
              </li>
            ))}
            <li className="pt-2">
              <GoogleSignInButton size="md" className="!w-full" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
