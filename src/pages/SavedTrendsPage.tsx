import { BookmarkIcon } from '@/components/ui/icons'
import { SavedTrendsPanel } from '@/components/trends'
import { useSavedTrends } from '@/hooks/useSavedTrends'

export function SavedTrendsPage() {
  const { savedTrends, isSaved, toggleSave } = useSavedTrends()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          <BookmarkIcon className="size-3.5" aria-hidden />
          Bibliothek
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Saved Trends
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {savedTrends.length} gespeicherte Insights — lokal synchronisiert.
        </p>
      </header>

      <SavedTrendsPanel trends={savedTrends} isSaved={isSaved} onToggleSave={toggleSave} />
    </div>
  )
}
