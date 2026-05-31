import { useCallback, useEffect, useRef, useState } from 'react'
import { TrendFilterBar, type TrendCategoryFilter, type TrendPlatformFilter } from '@/components/trends/TrendFilterBar'
import { TrendIntelligenceDashboard } from '@/components/trends/TrendIntelligenceDashboard'
import { TrendScoutSearch } from '@/components/trends/TrendScoutSearch'
import { filterTrends } from '@/lib/trend-signals'
import { TrendsGrid } from '@/components/trends/TrendsGrid'
import {
  SavedTrendsPanel,
  TrendHistoryTimeline,
  TrendsTabNav,
  type TrendsView,
} from '@/components/trends'
import { LowCreditBanner } from '@/components/subscription/LowCreditBanner'
import { TrendsGridSkeleton } from '@/components/ui/Skeleton'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import { useTrendHistory } from '@/hooks/useTrendHistory'
import { useTrendSessionRestore } from '@/hooks/useTrendSessionRestore'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { MAX_FREE_CREDITS } from '@/lib/constants'
import { createSearchNonce, getDemoUserSeed } from '@/lib/demo-trend-seed'
import { markDemoSeen, shouldShowDemoOnLoad } from '@/lib/trend-intelligence'
import { runAiGenerationPipeline } from '@/lib/ai-generation-pipeline'
import { trackAnalyticsEvent } from '@/lib/track-event'
import {
  fetchDemoTrends,
  fetchTrendsPage,
  LOAD_MORE_PAGE_SIZE,
} from '@/lib/trends-api'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function TrendIntelligencePanel() {
  const { hasProAccess, usage, isCreditsLow, requireCredits, consumeCreditAfterSuccess } =
    useUsageLimit()
  const { savedTrends, savedCount, isSaved, toggleSave, unsave } = useSavedTrends()
  const { history, logSearch, clear, removeEntry } = useTrendHistory()
  const { isRestoring, initial, persist, restoreScroll } = useTrendSessionRestore()

  const [view, setView] = useState<TrendsView>(initial?.view ?? 'explore')
  const [searchQuery, setSearchQuery] = useState(initial?.searchQuery ?? '')
  const [platform, setPlatform] = useState<TrendPlatformFilter>(
    (initial?.platform as TrendPlatformFilter) ?? 'all',
  )
  const [categoryFilter, setCategoryFilter] = useState<TrendCategoryFilter>('all')
  const [openTrendId, setOpenTrendId] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(
    () => Boolean(initial?.searchQuery?.trim()) && !initial?.isDemo,
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [searchNonce, setSearchNonce] = useState<string | null>(null)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const [trends, setTrends] = useState<TrendIntelligence[]>(initial?.trends ?? [])
  const [isDemo, setIsDemo] = useState(initial?.isDemo ?? false)
  const [error, setError] = useState<string | null>(null)

  const sessionReadyRef = useRef(false)
  const scrollRestoredRef = useRef(false)

  const remaining = usage.unlimited ? null : (usage.remaining ?? 0)
  const creditLimit = usage.limit ?? MAX_FREE_CREDITS

  const loadDemo = useCallback(async () => {
    setIsLoadingDemo(true)
    setError(null)
    setHasSearched(false)
    try {
      const results = await fetchDemoTrends({ userSeed: getDemoUserSeed() })
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
    if (isRestoring) return

    sessionReadyRef.current = true

    if (initial?.trends.length) {
      return
    }

    if (shouldShowDemoOnLoad()) {
      queueMicrotask(() => {
        void loadDemo()
      })
    }
  }, [isRestoring, initial, loadDemo])

  useEffect(() => {
    if (!sessionReadyRef.current) return

    persist({
      searchQuery,
      platform,
      trends,
      isDemo,
      view,
    })
  }, [searchQuery, platform, trends, isDemo, view, persist])

  useEffect(() => {
    if (isRestoring || scrollRestoredRef.current || trends.length === 0) return
    scrollRestoredRef.current = true
    restoreScroll()
  }, [isRestoring, trends.length, restoreScroll])

  async function handleSearch() {
    const query = searchQuery.trim()
    if (!query) {
      setError('Bitte gib eine Nische oder ein Suchthema ein.')
      return
    }

    setError(null)
    setIsSearching(true)
    setIsDemo(false)
    setHasSearched(true)
    setView('explore')

    try {
      if (!requireCredits()) {
        setIsSearching(false)
        return
      }

      const platformLabel = platform === 'all' ? 'Alle Plattformen' : platform
      const nonce = createSearchNonce()
      const page = await runAiGenerationPipeline({
        tool: 'Trend-Scouting',
        label: `Trend-Suche: ${query}`,
        generation_type: 'search',
        niche: query,
        platform: platformLabel,
        prompt: `Trend-Suche: ${query}`,
        trackAnalytics: false,
        timeoutMs: 30_000,
        run: () =>
          fetchTrendsPage(query, {
            userSeed: getDemoUserSeed(),
            nonce,
            offset: 0,
          }),
      })
      setSearchNonce(page.nonce)
      setHasMore(page.hasMore)
      setTrends(page.trends)
      const results = page.trends
      markDemoSeen()
      logSearch(query, platformLabel, results.length)
      trackAnalyticsEvent('niche_search', {
        niche: query,
        platform: platformLabel,
        results: results.length,
      })
      await consumeCreditAfterSuccess({
        tool: 'Trend-Scouting',
        label: `Trend-Suche: ${query}`,
        niche: query,
        platform: platformLabel,
        prompt: `Trend-Suche: ${query}`,
        generation_type: 'search',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unbekannter Fehler bei der Trend-Suche.',
      )
    } finally {
      setIsSearching(false)
    }
  }

  const loadMore = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query || isLoadingMore || !hasMore || isDemo || !searchNonce) return

    setIsLoadingMore(true)
    setError(null)
    try {
      const page = await fetchTrendsPage(query, {
        userSeed: getDemoUserSeed(),
        nonce: searchNonce,
        offset: trends.length,
        limit: LOAD_MORE_PAGE_SIZE,
      })
      setTrends((prev) => {
        const ids = new Set(prev.map((t) => t.id))
        const fresh = page.trends.filter((t) => !ids.has(t.id))
        return [...prev, ...fresh]
      })
      setHasMore(page.hasMore)
    } catch {
      setError('Weitere Trends konnten nicht geladen werden.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [searchQuery, isLoadingMore, hasMore, isDemo, searchNonce, trends.length])

  const filteredTrends = filterTrends(trends, platform, categoryFilter)

  const isBusy = isSearching || isLoadingDemo

  const platformFilterLabel =
    platform === 'tiktok'
      ? 'TikTok'
      : platform === 'instagram'
        ? 'Instagram'
        : platform === 'youtube'
          ? 'YouTube'
          : undefined

  if (isRestoring) {
    return (
      <div
        className="trends-grid-shell space-y-5"
        aria-busy="true"
        aria-label="Trend Intelligence wird geladen"
      >
        <div className="h-11 animate-shimmer rounded-xl bg-zinc-800/40" />
        <div className="space-y-3">
          <div className="h-12 animate-shimmer rounded-xl bg-zinc-800/40" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 flex-1 animate-shimmer rounded-lg bg-zinc-800/30" />
            ))}
          </div>
        </div>
        <TrendsGridSkeleton />
      </div>
    )
  }

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
            hidePlatformToggles
          />

          <TrendFilterBar
            platform={platform}
            category={categoryFilter}
            onPlatformChange={setPlatform}
            onCategoryChange={setCategoryFilter}
            disabled={isBusy}
          />

          {filteredTrends.length > 0 && !isBusy && (
            <TrendIntelligenceDashboard
              trends={filteredTrends}
              onSelectTrend={(id) => setOpenTrendId(id)}
            />
          )}

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

          {isLoadingDemo && trends.length === 0 ? (
            <div className="trends-grid-shell mt-2 min-h-[520px]">
              <TrendsGridSkeleton />
            </div>
          ) : (
            <TrendsGrid
              trends={filteredTrends}
              isSearching={isSearching}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore && !isDemo && hasSearched}
              onLoadMore={() => void loadMore()}
              isDemo={isDemo}
              hasSearched={hasSearched || trends.length > 0}
              searchQuery={searchQuery.trim()}
              platformFilter={platformFilterLabel}
              creditsRemaining={remaining}
              creditsLimit={creditLimit}
              onTryDemo={() => void loadDemo()}
              isSaved={isSaved}
              onToggleSave={toggleSave}
              autoOpenTrendId={openTrendId}
              onAutoOpenHandled={() => setOpenTrendId(null)}
            />
          )}
        </>
      )}

      {view === 'saved' && (
        <SavedTrendsPanel
          trends={savedTrends}
          isSaved={isSaved}
          onToggleSave={toggleSave}
          onRemove={unsave}
        />
      )}

      {view === 'history' && (
        <TrendHistoryTimeline
          history={history}
          onSelectQuery={(q) => {
            setSearchQuery(q)
            setHasSearched(true)
            setView('explore')
          }}
          onRemove={removeEntry}
          onClear={clear}
        />
      )}
    </div>
  )
}
