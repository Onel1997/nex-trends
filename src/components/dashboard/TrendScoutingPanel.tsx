import { useCallback, useEffect, useState } from 'react'
import { TrendScoutSearch, type ScoutPlatform } from '@/components/dashboard/TrendScoutSearch'
import { TrendsGrid } from '@/components/dashboard/TrendsGrid'
import { LowCreditBanner } from '@/components/subscription/LowCreditBanner'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { MAX_FREE_CREDITS } from '@/lib/constants'
import { markDemoSeen, shouldShowDemoOnLoad } from '@/lib/trend-intelligence'
import { fetchDemoTrends, fetchTrendsByNiche } from '@/lib/trends-api'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function TrendScoutingPanel() {
  const { hasProAccess, usage, isCreditsLow, consumeUsage } = useUsageLimit()
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

    try {
      if (!hasProAccess) {
        const usageResult = await consumeUsage({
          tool: 'Trend-Scouting',
          label: `Trend-Suche: ${query}`,
        })
        if (!usageResult.allowed) {
          return
        }
      }

      const results = await fetchTrendsByNiche(query)
      setTrends(results)
      markDemoSeen()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unbekannter Fehler bei der Trend-Suche.'
      setError(message)
    } finally {
      setIsSearching(false)
    }
  }

  function handleNicheSelect(niche: string) {
    setSearchQuery(niche)
  }

  const filteredTrends =
    platform === 'all'
      ? trends
      : trends.filter(
          (t) => t.platform.toLowerCase() === platform.toLowerCase(),
        )

  return (
    <>
      {!hasProAccess && isCreditsLow && (
        <LowCreditBanner remaining={remaining ?? 0} className="mb-4" />
      )}

      <TrendScoutSearch
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        platform={platform}
        onPlatformChange={setPlatform}
        isSearching={isSearching || isLoadingDemo}
        disabled={isSearching || isLoadingDemo}
        onSearch={handleSearch}
        onNicheSelect={handleNicheSelect}
      />

      {!hasProAccess && remaining !== null && (
        <p className="mt-3 text-center text-xs text-zinc-500 sm:text-left">
          <span className="font-medium text-violet-300">{remaining}</span> von{' '}
          {creditLimit} Credits · 1 Credit pro Analyse
          {usage.usageResetDate && (
            <>
              {' '}
              · Nächste Aufladung{' '}
              {new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: 'short',
              }).format(new Date(usage.usageResetDate))}
            </>
          )}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <TrendsGrid
        trends={filteredTrends}
        isSearching={isSearching || isLoadingDemo}
        isDemo={isDemo}
        creditsRemaining={remaining}
        creditsLimit={creditLimit}
        onTryDemo={() => void loadDemo()}
      />
    </>
  )
}
