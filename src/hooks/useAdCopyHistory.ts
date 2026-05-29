import { useCallback, useEffect, useState } from 'react'
import { fetchAdCopyGenerationHistory } from '@/lib/ai/ad-copy-generator'
import { isAdCopyTableUnavailableError } from '@/lib/ad-copy-db'
import type { AdCopyGenerationBatch } from '@/types/ad-copy-generation'

export function useAdCopyHistory(autoLoad = true) {
  const [history, setHistory] = useState<AdCopyGenerationBatch[]>([])
  const [isLoading, setIsLoading] = useState(autoLoad)
  const [error, setError] = useState<string | null>(null)
  const [storageUnavailable, setStorageUnavailable] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const batches = await fetchAdCopyGenerationHistory(25)
      setHistory(batches)
      setStorageUnavailable(false)
    } catch (err) {
      if (isAdCopyTableUnavailableError(err)) {
        setStorageUnavailable(true)
        setHistory([])
        return
      }
      setError(err instanceof Error ? err.message : 'Verlauf konnte nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoLoad) void refresh()
  }, [autoLoad, refresh])

  return { history, isLoading, error, storageUnavailable, refresh }
}
