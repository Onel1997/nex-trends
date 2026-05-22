import { useState } from 'react'
import { SearchIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

export type ScoutPlatform = 'all' | 'tiktok' | 'instagram'

const PLATFORMS: { id: ScoutPlatform; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
]

export function TrendScoutSearch() {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState<ScoutPlatform>('all')

  return (
    <section
      aria-labelledby="trend-scout-heading"
      className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5 lg:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="trend-scout-heading"
            className="text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            Trend-Scouting
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Virale Inhalte auf TikTok & Instagram finden
          </p>
        </div>
        <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 sm:mt-0">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
          Live-Daten (Demo)
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Plattform filtern">
        {PLATFORMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={platform === item.id}
            onClick={() => setPlatform(item.id)}
            className={cn(
              'min-h-9 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm',
              platform === item.id
                ? 'bg-violet-600/20 text-violet-200 ring-1 ring-inset ring-violet-500/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">Trends durchsuchen</span>
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nische, Hashtag oder Creator suchen …"
          className="w-full min-h-12 rounded-xl border border-zinc-700/80 bg-zinc-950 py-3 pl-12 pr-4 text-base text-white placeholder:text-zinc-600 transition-colors focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 sm:min-h-14 sm:text-sm"
        />
      </label>
    </section>
  )
}
