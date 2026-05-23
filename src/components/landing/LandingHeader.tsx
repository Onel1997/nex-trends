import { APP_NAME } from '@/lib'
import { scrollToLogin } from '@/lib/auth'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-lg font-bold tracking-tight text-white">{APP_NAME}</span>
        <button
          type="button"
          onClick={scrollToLogin}
          className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-300 hover:border-violet-500/50 hover:bg-zinc-800 hover:text-white"
        >
          Zum Dashboard
        </button>
      </div>
    </header>
  )
}
