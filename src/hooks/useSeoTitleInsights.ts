import { useMemo } from 'react'
import { getSeoTitleRecentCopies } from '@/lib/seo-title-analytics'
import { getSeoIntentLabel } from '@/lib/seo-title-display'
import type { SavedSeoTitleRow } from '@/types/seo-title-generation'

export function useSeoTitleInsights(savedTitles: SavedSeoTitleRow[]) {
  const recentCopies = useMemo(() => getSeoTitleRecentCopies(), [])

  const mostSavedIntent = useMemo(() => {
    if (savedTitles.length === 0) return null
    const counts = new Map<string, number>()
    for (const row of savedTitles) {
      const key = row.search_intent || 'informational'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    let best = ''
    let max = 0
    for (const [intent, count] of counts) {
      if (count > max) {
        max = count
        best = intent
      }
    }
    return getSeoIntentLabel(best) || null
  }, [savedTitles])

  return {
    recentCopies,
    mostSavedIntent,
    savedCount: savedTitles.length,
  }
}
