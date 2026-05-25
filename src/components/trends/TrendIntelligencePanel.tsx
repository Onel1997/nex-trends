import { useCallback, useEffect, useState } from 'react'
import { TrendScoutSearch, type ScoutPlatform } from '@/components/trends/TrendScoutSearch'
import { TrendsGrid } from '@/components/trends/TrendsGrid'
import {
  SavedTrendsPanel,
  TrendHistoryTimeline,
  TrendsTabNav,
  type TrendsView,
} from '@/components/trends'
import { LowCreditBanner } from '@/components/subscription/LowCreditBanner'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import { useTrendHistory } from '@/hooks/useTrendHistory'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { MAX_FREE_CREDITS } from '@/lib/constants'
import { markDemoSeen, shouldShowDemoOnLoad } from '@/lib/trend-intelligence'
import { fetchDemoTrends, fetchTrendsByNiche } from '@/lib/trends-api'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function TrendIntelligencePanel() {
  const { hasProAccess, usage, isCreditsLow, consumeUsage } = useUsageLimit()
  const { savedTrends, savedCount, isSaved, toggleSave } = useSavedTrends()
  const { history, logSearch, clear, removeEntry } = useTrendHistory()

  const [view, setView] = useState<TrendsView>('explore')
  const [searchQuery, setSearchQuery] = useState('')
  const [platform, setPlatform] = useState<ScoutPlatform>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const [trends, setTrends] = useState<TrendIntelligence[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = hasProAccess ? null : (usage.remaining ?? 0)
  const creditLimit = usage.limit ?? MAX_FREE_CREDITS

  const loadDemo = useCallback(async () => {
    setIsLoadingDemo(true)
    setError(null)
    try {
      const results = await fetchDemoTrends()
      setTrends(results)
      setIsDemo(true)
      markDemoSeen()
      setView('explore')
    } catch {
      setError('Demo-Daten konnten nicht geladen werden.')
    } finally {
      setIsLoadingDemo(false)
    }
  }, [])

  useEffect(() => {
    if (shouldShowDemoOnLoad()) {
      void loadDemo()
    }
  }, [loadDemo])

  async function handleSearch() {
    const query = searchQuery.trim()
    if (!query) {
      setError('Bitte gib eine Nische oder ein Suchthema ein.')
      return
    }

    setError(null)
    setIsSearching(true)
    setIsDemo(false)
    setView('explore')

    try {
      if (!hasProAccess) {
        const usageResult = await consumeUsage({
          tool: 'Trend-Scouting',
          label: `Trend-Suche: ${query}`,
        })
        if (!usageResult.allowed) return
      }

      const results = await fetchTrendsByNiche(query)
      setTrends(results)
      markDemoSeen()
      logSearch(query, platform === 'all' ? 'Alle Plattformen' : platform, results.length)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unbekannter Fehler bei der Trend-Suche.',
      )
    } finally {
      setIsSearching(false)
    }
  }

  const filteredTrends =
    platform === 'all'
      ? trends
      : trends.filter((t) => t.platform.toLowerCase() === platform.toLowerCase())

  const isBusy = isSearching || isLoadingDemo

  return (
    <div className="space-y-5">
      {!hasProAccess && isCreditsLow && (
        <LowCreditBanner remaining={remaining ?? 0} className="mb-1" />
      )}

      <TrendsTabNav active={view} onChange={setView} savedCount={savedCount} />

      {view === 'explore' && (
        <>
          <TrendScoutSearch
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            platform={platform}
            onPlatformChange={setPlatform}
            isSearching={isBusy}
            disabled={isBusy}
            onSearch={handleSearch}
            onNicheSelect={(niche) => setSearchQuery(niche)}
          />

          {!hasProAccess && remaining !== null && (
            <p className="text-center text-xs text-zinc-500 sm:text-left">
              <span className="font-medium text-violet-300/90">{remaining}</span> von{' '}
              {creditLimit} Credits · 1 Credit pro Analyse
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/25 bg-red-950/15 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <TrendsGrid
            trends={filteredTrends}
            isSearching={isBusy}
            isDemo={isDemo}
            creditsRemaining={remaining}
            creditsLimit={creditLimit}
            onTryDemo={() => void loadDemo()}
            isSaved={isSaved}
            onToggleSave={toggleSave}
          />
        </>
      )}

      {view === 'saved' && (
        <SavedTrendsPanel trends={savedTrends} isSaved={isSaved} onToggleSave={toggleSave} />
      )}

      {view === 'history' && (
        <TrendHistoryTimeline
          history={history}
          onSelectQuery={(q) => {
            setSearchQuery(q)
            setView('explore')
          }}
          onRemove={removeEntry}
          onClear={clear}
        />
      )}
    </div>
  )
}
