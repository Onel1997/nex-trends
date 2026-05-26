import { useCallback, useEffect, useState } from 'react'
import { fetchHookGenerationHistory } from '@/lib/ai/hook-generator'
import type { GeneratedHooksRow } from '@/types/ai-generation'

export function useHookHistory(autoLoad = true) {
  const [history, setHistory] = useState<GeneratedHooksRow[]>([])
  const [isLoading, setIsLoading] = useState(autoLoad)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const rows = await fetchHookGenerationHistory(25)
      setHistory(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verlauf konnte nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoLoad) void refresh()
  }, [autoLoad, refresh])

  return { history, isLoading, error, refresh }
}
