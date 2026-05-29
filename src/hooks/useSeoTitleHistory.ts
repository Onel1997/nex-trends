import { useCallback, useEffect, useState } from 'react'
import { fetchSeoTitleGenerationHistory } from '@/lib/ai/seo-title-generator'
import { isSeoTitleTableUnavailableError } from '@/lib/seo-title-db'
import type { SeoTitleGenerationBatch } from '@/types/seo-title-generation'

export function useSeoTitleHistory() {
  const [history, setHistory] = useState<SeoTitleGenerationBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const batches = await fetchSeoTitleGenerationHistory(20)
      setHistory(batches)
    } catch (err) {
      if (isSeoTitleTableUnavailableError(err)) {
        setHistory([])
        return
      }
      setError(err instanceof Error ? err.message : 'Verlauf konnte nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { history, isLoading, error, refresh }
}
