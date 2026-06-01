/**
 * Homepage hero — rendered at http://localhost:5173/ (Next.js catch-all).
 * Do not duplicate: landing uses `LandingHero` → `NexTrendsHero` separately.
 */
export default function HomePage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-2 border-b border-[#1f1f1f] px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 md:px-10 lg:px-12">
        <p className="shrink-0 text-base font-bold tracking-tight sm:text-xl md:text-[1.75rem]">
          NexTrends
        </p>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            className="rounded-lg border border-[#333] bg-transparent px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-white/5 sm:rounded-[10px] sm:px-[18px] sm:py-2.5 sm:text-sm"
          >
            Login
          </button>
          <button
            type="button"
            className="rounded-lg border-none bg-[#8b5cf6] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-transform hover:scale-105 sm:rounded-[10px] sm:px-[18px] sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Kostenlos starten</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <p className="mb-4 max-w-[calc(100vw-2rem)] truncate rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-medium text-purple-300 sm:mb-6 sm:max-w-none sm:px-4 sm:py-1.5 sm:text-sm">
          AI-Powered Marketing Suite
        </p>

        <h1
          className={[
            'w-full text-balance break-words font-bold tracking-tight',
            'max-w-[min(100%,20rem)] text-[1.5rem] leading-[1.2]',
            'min-[390px]:max-w-xs min-[390px]:text-[1.75rem]',
            'sm:max-w-2xl sm:text-4xl sm:leading-[1.12]',
            'md:max-w-4xl md:text-5xl md:leading-[1.1]',
            'lg:max-w-[900px] lg:text-6xl',
            'xl:text-7xl',
          ].join(' ')}
        >
          AI Marketing Suite für TikTok &amp; Instagram
        </h1>

        <p
          className={[
            'mt-4 w-full max-w-md text-pretty leading-relaxed text-zinc-400/90',
            'text-sm sm:mt-6 sm:max-w-[700px] sm:text-lg md:text-xl',
          ].join(' ')}
        >
          Entdecke virale Trends, generiere Hooks &amp; Ad Copy mit KI und automatisiere
          deinen Content Workflow.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-5">
          <button
            type="button"
            className="w-full rounded-xl border-none bg-[#8b5cf6] px-6 py-3.5 text-base font-semibold text-white transition-transform hover:scale-105 sm:w-auto sm:rounded-[14px] sm:px-[34px] sm:py-[18px] sm:text-lg"
          >
            Kostenlos starten
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-[#333] bg-transparent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto sm:rounded-[14px] sm:px-[34px] sm:py-[18px] sm:text-lg"
          >
            Live Demo
          </button>
        </div>
      </section>
    </main>
  )
}
