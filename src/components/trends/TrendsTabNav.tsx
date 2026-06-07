import { cn } from '@/lib'
import { BookmarkIcon, HistoryIcon, SearchIcon } from '@/components/ui/icons'

export type TrendsView = 'explore' | 'saved' | 'history'

type TrendsTabNavProps = {
  active: TrendsView
  onChange: (view: TrendsView) => void
  savedCount?: number
}

const TABS: { id: TrendsView; label: string; icon: typeof SearchIcon }[] = [
  { id: 'explore', label: 'Entdecken', icon: SearchIcon },
  { id: 'saved', label: 'Gespeichert', icon: BookmarkIcon },
  { id: 'history', label: 'Verlauf', icon: HistoryIcon },
]

export function TrendsTabNav({ active, onChange, savedCount = 0 }: TrendsTabNavProps) {
  return (
    <nav
      className="flex gap-1.5 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-1.5"
      aria-label="Trend-Bereiche"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-current={active === id ? 'page' : undefined}
          className={cn(
            'relative flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-smooth active:scale-[0.98] sm:text-sm',
            active === id
              ? 'bg-zinc-800/80 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span>{label}</span>
          {id === 'saved' && savedCount > 0 && (
            <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
              {savedCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
