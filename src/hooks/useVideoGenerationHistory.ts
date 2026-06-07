import { useCallback, useEffect, useState } from 'react'
import { fetchVideoHistory } from '@/lib/video-api'
import type { GeneratedVideoHistoryItem } from '@/types/generated-video'

export function useVideoGenerationHistory(enabled = true) {
  const [items, setItems] = useState<GeneratedVideoHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const list = await fetchVideoHistory(16)
      setItems(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verlauf konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh }
}
