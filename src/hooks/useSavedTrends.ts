import { useCallback, useEffect, useState } from 'react'
import {
  getSavedTrends,
  isTrendSaved,
  removeSavedTrend,
  saveTrend,
} from '@/lib/saved-trends'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function useSavedTrends() {
  const [saved, setSaved] = useState<TrendIntelligence[]>([])

  const refresh = useCallback(() => {
    setSaved(getSavedTrends())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const checkSaved = useCallback(
    (trendId: string) => isTrendSaved(trendId),
    [saved],
  )

  const toggleSave = useCallback(
    (trend: TrendIntelligence): boolean => {
      if (isTrendSaved(trend.id)) {
        removeSavedTrend(trend.id)
        refresh()
        return false
      }
      saveTrend(trend)
      refresh()
      return true
    },
    [refresh],
  )

  const unsave = useCallback(
    (trendId: string) => {
      removeSavedTrend(trendId)
      refresh()
    },
    [refresh],
  )

  return {
    savedTrends: saved,
    savedCount: saved.length,
    isSaved: checkSaved,
    toggleSave,
    unsave,
    refresh,
  }
}
