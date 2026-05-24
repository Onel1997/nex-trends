import { APP_NAME } from '@/lib'
import { scrollToSection } from '@/lib/scroll'

const FOOTER_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'social-proof', label: 'Erfolge' },
  { id: 'pricing', label: 'Preise' },
  { id: 'login', label: 'Anmelden' },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-black text-white">
                NT
              </span>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Die AI Marketing Suite für Creator und Brands auf TikTok & Instagram.
            </p>
          </div>

          <nav aria-label="Footer Navigation">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Produkt
            </p>
            <ul className="mt-3 space-y-2">
              {FOOTER_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(id)}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} {APP_NAME}. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-zinc-600">
            Made for creators · Powered by AI
          </p>
        </div>
      </div>
    </footer>
  )
}
