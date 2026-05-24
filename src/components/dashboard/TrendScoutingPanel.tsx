import { useState } from 'react'
import { TrendScoutSearch, type ScoutPlatform } from '@/components/dashboard/TrendScoutSearch'
import { TrendsGrid } from '@/components/dashboard/TrendsGrid'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { searchTrends } from '@/lib/openai'
import { FREE_MONTHLY_AI_LIMIT } from '@/lib/constants'
import type { DisplayTrend } from '@/components/dashboard/TrendCard'

const CARD_GRADIENTS = [
  { from: 'from-indigo-500', to: 'to-purple-600' },
  { from: 'from-violet-600', to: 'to-fuchsia-600' },
  { from: 'from-cyan-500', to: 'to-blue-600' },
  { from: 'from-rose-500', to: 'to-orange-600' },
] as const

export function TrendScoutingPanel() {
  const { hasProAccess, usage, consumeUsage, openUpgradeModal } = useUsageLimit()
  const [searchQuery, setSearchQuery] = useState('')
  const [platform, setPlatform] = useState<ScoutPlatform>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [trends, setTrends] = useState<DisplayTrend[]>([])
  const [error, setError] = useState<string | null>(null)

  const remaining = hasProAccess ? null : (usage.remaining ?? 0)
  const creditLimit = usage.limit ?? FREE_MONTHLY_AI_LIMIT

  async function handleSearch() {
    const query = searchQuery.trim()
    if (!query) {
      setError('Bitte gib eine Nische oder ein Suchthema ein.')
      return
    }

    if (!hasProAccess && remaining !== null && remaining <= 0) {
      openUpgradeModal()
      return
    }

    setError(null)
    setIsSearching(true)

    try {
      if (!hasProAccess) {
        const usageResult = await consumeUsage({
          tool: 'Trend-Scouting',
          label: `Trend-Suche: ${query}`,
        })
        if (!usageResult.allowed) {
          openUpgradeModal()
          return
        }
      }

      const results = await searchTrends(query)
      setTrends(
        results.map((trend, index) => ({
          ...trend,
          id: `${Date.now()}-${index}`,
          gradientFrom: CARD_GRADIENTS[index % CARD_GRADIENTS.length].from,
          gradientTo: CARD_GRADIENTS[index % CARD_GRADIENTS.length].to,
        })),
      )
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

  const filteredTrends =
    platform === 'all'
      ? trends
      : trends.filter(
          (t) => t.platform.toLowerCase() === platform.toLowerCase(),
        )

  return (
    <>
      <TrendScoutSearch
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        platform={platform}
        onPlatformChange={setPlatform}
        isSearching={isSearching}
        disabled={isSearching}
        onSearch={handleSearch}
      />

      {!hasProAccess && remaining !== null && (
        <p className="mt-3 text-center text-xs text-zinc-500 sm:text-left">
          <span className="font-medium text-violet-300">{remaining}</span> von{' '}
          {creditLimit} Credits · 1 Credit pro Suche
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
        isSearching={isSearching}
        creditsRemaining={remaining}
        creditsLimit={creditLimit}
      />
    </>
  )
}
