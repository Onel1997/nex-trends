import { useCallback, useEffect, useState } from 'react'
import { fetchCodeGenerationHistory } from '@/lib/ai/code-generator'
import { isCodeTableUnavailableError } from '@/lib/code-db'
import type { CodeGeneration } from '@/types/code-generation'

export function useCodeHistory(autoLoad = true) {
  const [history, setHistory] = useState<CodeGeneration[]>([])
  const [isLoading, setIsLoading] = useState(autoLoad)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const items = await fetchCodeGenerationHistory(25)
      setHistory(items)
    } catch (err) {
      if (isCodeTableUnavailableError(err)) {
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

  return { history, isLoading, error, refresh }
}
