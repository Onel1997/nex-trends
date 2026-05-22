import { APP_NAME } from '@/lib'
import { TrendScoutSearch } from './TrendScoutSearch'
import { TrendsGrid } from './TrendsGrid'

export function DashboardMain() {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        className="pointer-events-none absolute -right-32 top-0 size-80 rounded-full bg-violet-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-64 rounded-full bg-fuchsia-600/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-5 sm:mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Willkommen zurück
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Scoute die heißesten Trends für {APP_NAME} — optimiert für TikTok und
            Instagram.
          </p>
        </header>

        <TrendScoutSearch />
        <TrendsGrid />
      </div>
    </div>
  )
}
