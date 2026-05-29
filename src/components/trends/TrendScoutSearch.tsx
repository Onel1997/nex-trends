import { SearchIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/Button'
import { InputWithIcon } from '@/components/ui/Input'
import { cn } from '@/lib'

export type ScoutPlatform = 'all' | 'tiktok' | 'instagram'

const PLATFORMS: { id: ScoutPlatform; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
]

const NICHE_SUGGESTIONS = [
  'Productivity',
  'Fitness',
  'Beauty',
  'Side Hustle',
  'Food',
  'Luxury',
  'Motivation',
  'AI',
  'Business',
  'Fashion',
] as const

type TrendScoutSearchProps = {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  platform: ScoutPlatform
  onPlatformChange: (platform: ScoutPlatform) => void
  isSearching: boolean
  disabled?: boolean
  onSearch: () => void
  onNicheSelect?: (niche: string) => void
}

export function TrendScoutSearch({
  searchQuery,
  onSearchQueryChange,
  platform,
  onPlatformChange,
  isSearching,
  disabled = false,
  onSearch,
  onNicheSelect,
}: TrendScoutSearchProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <section
      aria-labelledby="trend-scout-heading"
      className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)] sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="trend-scout-heading"
            className="text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            Trend Intelligence
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            Viral Score, Hashtags, Hooks & Content Ideas · 1 Credit pro Analyse
          </p>
        </div>
        <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-400 sm:mt-0">
          <span className="size-1.5 animate-pulse-soft rounded-full bg-violet-400" aria-hidden />
          KI-gestützt
        </span>
      </div>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Plattform filtern"
      >
        {PLATFORMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={platform === item.id}
            disabled={disabled || isSearching}
            onClick={() => onPlatformChange(item.id)}
            className={cn(
              'min-h-9 rounded-xl px-4 py-2 text-xs font-medium transition-smooth sm:text-sm',
              'disabled:cursor-not-allowed disabled:opacity-50',
              platform === item.id
                ? 'bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/30'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        className="relative mt-5 flex flex-col gap-3 sm:flex-row sm:gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSearch()
        }}
      >
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Trends durchsuchen</span>
          <InputWithIcon
            type="search"
            icon={<SearchIcon className="size-5" aria-hidden />}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSearching}
            placeholder="Nische, Hashtag oder Creator suchen …"
          />
        </label>
        <Button
          type="submit"
          variant="pro"
          size="lg"
          loading={isSearching}
          disabled={disabled || isSearching}
          className="shrink-0 sm:min-w-[7rem]"
        >
          {isSearching ? 'Suche …' : 'Suchen'}
        </Button>
      </form>

      {onNicheSelect && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Beliebte Nischen
          </p>
          <div className="flex flex-wrap gap-2">
            {NICHE_SUGGESTIONS.map((niche) => (
              <button
                key={niche}
                type="button"
                disabled={disabled || isSearching}
                onClick={() => onNicheSelect(niche)}
                className={cn(
                  'rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-smooth',
                  'hover:border-violet-500/30 hover:text-violet-200 disabled:opacity-50',
                )}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
