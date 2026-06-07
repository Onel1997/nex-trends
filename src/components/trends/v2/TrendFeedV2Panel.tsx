'use client'

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { TrendCategoryFilterV2 } from '@/components/trends/v2/TrendCategoryFilterV2'
import { TrendFeedV2List } from '@/components/trends/v2/TrendFeedV2List'
import { TrendsTabNav, type TrendsView } from '@/components/trends/TrendsTabNav'
import { TrendDetailModalLoading } from '@/components/trends/TrendDetailModalLoading'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { useToast } from '@/context/ToastContext'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import { openHookGeneratorForTrend } from '@/lib/trend-to-hook-prefill'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  attachTrendV2Signals,
  fetchTrendFeedV2,
  filterTrendsV2,
  sortTrendsByOpportunity,
  type TrendCategoryFilterV2 as TrendCategoryFilterId,
  type TrendWithV2,
} from '@/lib/trend-v2'

const TrendDetailModalV2 = lazy(() =>
  import('@/components/trends/v2/TrendDetailModalV2').then((m) => ({
    default: m.TrendDetailModalV2,
  })),
)

export function TrendFeedV2Panel() {
  const { showToast } = useToast()
  const { savedTrends, savedCount, isSaved, toggleSave, isLoading: savedLoading } =
    useSavedTrends()

  const [view, setView] = useState<TrendsView>('explore')
  const [category, setCategory] = useState<TrendCategoryFilterId>('all')
  const [trends, setTrends] = useState<TrendWithV2[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrend, setSelectedTrend] = useState<TrendWithV2 | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    void fetchTrendFeedV2()
      .then((results) => {
        if (cancelled) return
        setTrends(sortTrendsByOpportunity(results))
      })
      .catch(() => {
        if (cancelled) return
        setError('Trend Feed konnte nicht geladen werden.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredTrends = useMemo(
    () => sortTrendsByOpportunity(filterTrendsV2(trends, category)),
    [trends, category],
  )

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<TrendCategoryFilterId, number>> = { all: trends.length }
    for (const trend of trends) {
      counts[trend.v2.category] = (counts[trend.v2.category] ?? 0) + 1
    }
    return counts
  }, [trends])

  const savedTrendsV2 = useMemo(
    () => savedTrends.map((t) => attachTrendV2Signals(t)),
    [savedTrends],
  )

  const handleToggleSave = useCallback(
    (trend: TrendWithV2): boolean => {
      const { v2: _v2, ...rest } = trend
      return toggleSave(rest)
    },
    [toggleSave],
  )

  const handleGenerateHook = useCallback(
    (trend: TrendWithV2) => {
      openHookGeneratorForTrend(trend)
      showToast({
        type: 'info',
        title: 'Hook Generator geöffnet',
        message: `"${trend.title}" wurde vorausgefüllt.`,
      })
    },
    [showToast],
  )

  const topOpportunity = filteredTrends[0]

  return (
    <div className="ti-v2-panel min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-5">
      <TrendsTabNav active={view} onChange={setView} savedCount={savedCount} />

      {view === 'explore' && (
        <>
          <div className="ti-v2-hero rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.08] via-zinc-900/40 to-fuchsia-500/[0.06] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/90">
                  Entscheidungs-Feed
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  <span className="font-semibold text-white tabular-nums">{filteredTrends.length}</span>{' '}
                  Trends · sortiert nach Opportunity Score
                </p>
              </div>
              {topOpportunity && !isLoading && (
                <div className="min-w-0 rounded-xl border border-violet-500/20 bg-zinc-950/40 px-3.5 py-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                    Top Opportunity
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-violet-100">
                    {topOpportunity.title}
                  </p>
                  <p className="text-xs font-bold tabular-nums text-fuchsia-300">
                    {topOpportunity.v2.opportunityScore} ·{' '}
                    {topOpportunity.v2.opportunityScore >= 90 ? 'Viral' : 'Strong'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <TrendCategoryFilterV2
            category={category}
            onCategoryChange={setCategory}
            counts={categoryCounts}
            disabled={isLoading}
          />

          {error && <ErrorBanner error={error} />}

          <TrendFeedV2List
            trends={filteredTrends}
            isLoading={isLoading}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onGenerateHook={handleGenerateHook}
            onSelectTrend={(t) => setSelectedTrend(t)}
          />
        </>
      )}

      {view === 'saved' && (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">
            <span className="font-medium text-violet-300/90 tabular-nums">{savedCount}</span>{' '}
            gespeichert
            {isSupabaseConfigured() ? ' · synchronisiert mit deinem Account' : ' · lokal gespeichert'}
          </p>
          <TrendFeedV2List
            trends={savedTrendsV2}
            isLoading={savedLoading}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            onGenerateHook={handleGenerateHook}
            onSelectTrend={(t) => setSelectedTrend(t)}
            emptyTitle="Noch keine gespeicherten Trends"
            emptyDescription="Speichere Trends aus dem Feed — deine Bibliothek wächst mit jeder Entscheidung."
          />
        </>
      )}

      {view === 'history' && (
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-8 text-center">
          <p className="text-sm font-medium text-zinc-300">Suchverlauf</p>
          <p className="mt-2 text-xs text-zinc-500">
            Im V2 Feed siehst du alle Trends sofort — ohne Suche. Der Verlauf bleibt in der
            klassischen Scout-Ansicht verfügbar.
          </p>
        </div>
      )}

      <Suspense fallback={<TrendDetailModalLoading />}>
        <TrendDetailModalV2
          trend={selectedTrend}
          onClose={() => setSelectedTrend(null)}
          isSaved={selectedTrend ? isSaved(selectedTrend.id) : false}
          onToggleSave={handleToggleSave}
          onGenerateHook={handleGenerateHook}
        />
      </Suspense>
    </div>
  )
}
