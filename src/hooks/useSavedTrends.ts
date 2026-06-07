import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchSavedTrendsFromSupabase,
  recordsToTrends,
  removeSavedTrendFromSupabase,
  syncLocalSavedTrendsToSupabase,
  upsertSavedTrendToSupabase,
} from '@/lib/dashboard-saved-trends-api'
import {
  getSavedTrendRecords,
  getSavedTrends as getLocalSavedTrends,
  removeSavedTrend as removeLocalSavedTrend,
  saveTrend as saveLocalTrend,
} from '@/lib/saved-trends'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const SAVED_STORAGE_KEY = 'nextrends_saved_trends'

export function useSavedTrends() {
  const [saved, setSaved] = useState<TrendIntelligence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const syncedRef = useRef(false)

  const refresh = useCallback(async () => {
    setError(null)

    if (!isSupabaseConfigured()) {
      setSaved(getLocalSavedTrends())
      setIsLoading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id

    if (!userId) {
      setSaved(getLocalSavedTrends())
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      if (!syncedRef.current) {
        const localRecords = getSavedTrendRecords()
        if (localRecords.length > 0) {
          await syncLocalSavedTrendsToSupabase(userId, localRecords)
        }
        syncedRef.current = true
      }

      const records = await fetchSavedTrendsFromSupabase(userId)
      const trends = recordsToTrends(records)
      setSaved(trends.length > 0 ? trends : getLocalSavedTrends())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trends konnten nicht geladen werden')
      setSaved(getLocalSavedTrends())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_STORAGE_KEY) void refresh()
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
      const wasSaved = checkSaved(trend.id)

      if (wasSaved) {
        removeLocalSavedTrend(trend.id)
        setSaved((prev) => prev.filter((t) => t.id !== trend.id))
        void supabase.auth.getSession().then(({ data }) => {
          const userId = data.session?.user?.id
          if (userId) void removeSavedTrendFromSupabase(userId, trend.id)
        })
        return false
      }

      const savedAt = new Date().toISOString()
      const withMeta = { ...trend, savedAt }
      saveLocalTrend(trend)
      setSaved((prev) => [withMeta, ...prev.filter((t) => t.id !== trend.id)])
      void supabase.auth.getSession().then(({ data }) => {
        const userId = data.session?.user?.id
        if (userId) void upsertSavedTrendToSupabase(userId, withMeta)
      })
      return true
    },
    [checkSaved],
  )

  const unsave = useCallback((trendId: string) => {
    removeLocalSavedTrend(trendId)
    setSaved((prev) => prev.filter((t) => t.id !== trendId))
    void supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id
      if (userId) void removeSavedTrendFromSupabase(userId, trendId)
    })
  }, [])

  return {
    savedTrends: saved,
    savedCount: saved.length,
    isSaved: checkSaved,
    toggleSave,
    unsave,
    refresh,
    isLoading,
    error,
  }
}
