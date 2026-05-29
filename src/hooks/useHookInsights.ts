import { useMemo } from 'react'
import { getRecentCopies } from '@/lib/hook-analytics'
import { getToneLabel } from '@/lib/hook-display'
import type { SavedHookRow } from '@/types/ai-generation'

export function useHookInsights(savedHooks: SavedHookRow[]) {
  const recentCopies = useMemo(() => getRecentCopies(), [])

  const mostSavedTone = useMemo(() => {
    const counts = new Map<string, number>()
    for (const hook of savedHooks) {
      if (!hook.tone) continue
      counts.set(hook.tone, (counts.get(hook.tone) ?? 0) + 1)
    }
    let best: string | null = null
    let bestCount = 0
    for (const [tone, count] of counts) {
      if (count > bestCount) {
        best = tone
        bestCount = count
      }
    }
    return best ? { tone: best, label: getToneLabel(best), count: bestCount } : null
  }, [savedHooks])

  return {
    recentCopies,
    mostSavedTone,
    savedCount: savedHooks.length,
  }
}
