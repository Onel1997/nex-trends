import { useMemo } from 'react'
import { getAdCopyRecentCopies } from '@/lib/ad-copy-analytics'
import { getAdCopyToneLabel } from '@/lib/ad-copy-display'
import type { SavedAdCopyRow } from '@/types/ad-copy-generation'

export function useAdCopyInsights(savedAds: SavedAdCopyRow[]) {
  const recentCopies = useMemo(() => getAdCopyRecentCopies(), [])

  const mostSavedTone = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ad of savedAds) {
      if (!ad.tone) continue
      counts.set(ad.tone, (counts.get(ad.tone) ?? 0) + 1)
    }
    let best: string | null = null
    let bestCount = 0
    for (const [tone, count] of counts) {
      if (count > bestCount) {
        best = tone
        bestCount = count
      }
    }
    return best ? { tone: best, label: getAdCopyToneLabel(best), count: bestCount } : null
  }, [savedAds])

  return {
    recentCopies,
    mostSavedTone,
    savedCount: savedAds.length,
  }
}
