import { useCallback, useEffect, useState } from 'react'
import {
  deleteMyAiVideo,
  fetchMyAiVideos,
  regenerateMyAiVideo,
} from '@/lib/my-videos-api'
import type {
  PlatformFilter,
  SavedAiVideo,
  StatusFilter,
} from '@/types/ai-video-library'

export function useMyAiVideos() {
  const [videos, setVideos] = useState<SavedAiVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await fetchMyAiVideos({
        platform: platformFilter,
        status: statusFilter,
      })
      setVideos(items)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Videos konnten nicht geladen werden',
      )
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [platformFilter, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const remove = useCallback(
    async (video: SavedAiVideo) => {
      setDeletingId(video.id)
      try {
        await deleteMyAiVideo(video)
        setVideos((prev) => prev.filter((v) => v.id !== video.id))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Löschen fehlgeschlagen',
        )
      } finally {
        setDeletingId(null)
      }
    },
    [],
  )

  const regenerate = useCallback(async (video: SavedAiVideo) => {
    if (!video.jobId) return
    setRegeneratingId(video.id)
    try {
      await regenerateMyAiVideo(video)
      await load()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Regenerieren fehlgeschlagen',
      )
    } finally {
      setRegeneratingId(null)
    }
  }, [load])

  return {
    videos,
    loading,
    error,
    platformFilter,
    statusFilter,
    setPlatformFilter,
    setStatusFilter,
    refresh: load,
    remove,
    regenerate,
    deletingId,
    regeneratingId,
  }
}
