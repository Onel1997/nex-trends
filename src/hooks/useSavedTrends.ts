import { useCallback, useEffect, useState } from 'react'
import {
  getSavedTrends,
  isTrendSaved,
  removeSavedTrend,
  saveTrend,
} from '@/lib/saved-trends'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const SAVED_STORAGE_KEY = 'nextrends_saved_trends'

export function useSavedTrends() {
  const [saved, setSaved] = useState<TrendIntelligence[]>([])

  const refresh = useCallback(() => {
    setSaved(getSavedTrends())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_STORAGE_KEY) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const checkSaved = useCallback(
    (trendId: string) => saved.some((t) => t.id === trendId),
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
