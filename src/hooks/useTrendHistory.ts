import { useCallback, useEffect, useState } from 'react'
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistoryEntry,
} from '@/lib/trend-history'
import type { TrendSearchHistoryEntry } from '@/types/trend-intelligence'

export function useTrendHistory() {
  const [history, setHistory] = useState<TrendSearchHistoryEntry[]>([])

  const refresh = useCallback(() => {
    setHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logSearch = useCallback(
    (query: string, platform: string, resultCount: number) => {
      addSearchHistory(query, platform, resultCount)
      refresh()
    },
    [refresh],
  )

  const clear = useCallback(() => {
    clearSearchHistory()
    refresh()
  }, [refresh])

  const removeEntry = useCallback(
    (id: string) => {
      removeSearchHistoryEntry(id)
      refresh()
    },
    [refresh],
  )

  return {
    history,
    logSearch,
    clear,
    removeEntry,
    refresh,
  }
}
