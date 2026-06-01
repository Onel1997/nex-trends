'use client'

import { useEffect, useState } from 'react'
import { APP_NAME, cn } from '@/lib'
import { scrollToSection } from '@/lib/scroll'
import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'

const NAV_LINKS = [
  { id: 'dashboard', label: 'Produkt' },
  { id: 'feature-grid', label: 'Features' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'ai-video-studio', label: 'AI Video' },
  { id: 'pricing', label: 'Preise' },
] as const

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  function handleNav(id: string) {
    setMobileOpen(false)
    document.body.style.removeProperty('overflow')
    document.documentElement.style.removeProperty('overflow')
    scrollToSection(id)
  }

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
    }
  }, [mobileOpen])

  useEffect(() => {
    return () => {
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
    }
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="landing-header sticky top-0 z-50 px-3 pt-2 sm:px-4 sm:pt-4">
      <div
        className={cn(
          'landing-nav-shell mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-xl border px-2.5 transition-all duration-500 sm:gap-3 sm:rounded-2xl sm:px-4',
          scrolled
            ? 'landing-nav-shell--scrolled border-white/[0.08] bg-black/65 py-1.5 shadow-[0_8px_32px_-14px_rgba(0,0,0,0.75),0_0_0_1px_rgba(139,92,246,0.05)] backdrop-blur-2xl sm:py-2.5'
            : 'border-white/[0.06] bg-black/40 py-2 backdrop-blur-xl sm:py-3',
        )}
      >
        <a
          href="/"
          className="group flex min-w-0 shrink items-center gap-2.5 text-base font-bold tracking-[-0.03em] text-white sm:gap-3"
          aria-label={`${APP_NAME} Startseite`}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-[9px] font-black text-white shadow-[0_0_20px_-6px_rgba(139,92,246,0.5)] ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 sm:size-9 sm:rounded-xl sm:text-xs">
            NT
          </span>
          <span className="truncate text-sm sm:text-base">
            <span className="text-zinc-400">Nex</span>
            <span>Trends</span>
          </span>
        </a>

        <nav
          className="hidden items-center gap-0.5 rounded-xl border border-white/[0.04] bg-white/[0.02] p-1 lg:flex"
          aria-label="Hauptnavigation"
        >
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleNav(id)}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-zinc-400 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handleNav('login')}
            className="landing-btn-secondary hidden !min-h-9 !rounded-xl !px-3.5 !py-2 !text-[13px] lg:inline-flex"
          >
            Anmelden
          </button>
          <GoogleSignInButton
            label="Starten"
            size="md"
            className="landing-btn-primary hidden lg:inline-flex !w-auto !min-h-9 !rounded-xl !px-4 !py-2 !text-[13px]"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 backdrop-blur-sm transition-all duration-300 sm:rounded-xl sm:size-9 lg:hidden active:scale-95',
              mobileOpen && 'border-violet-500/30 bg-violet-500/[0.08] text-white',
            )}
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className="landing-nav-mobile mx-auto mt-1.5 max-w-6xl rounded-xl border border-white/[0.08] bg-black/90 px-3 py-3 backdrop-blur-2xl sm:mt-2 sm:rounded-2xl sm:px-4 sm:py-4 lg:hidden animate-fade-in"
          aria-label="Mobile Navigation"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => handleNav(id)}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
                >
                  {label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => handleNav('login')}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
              >
                Anmelden
              </button>
            </li>
            <li className="pt-2">
              <GoogleSignInButton size="md" className="!w-full" />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
