import { useCallback, useEffect, useRef, useState } from 'react'
import type { AdminApiResult } from '@/lib/admin-api'
import { isAdminAuthError, logAdminError } from '@/lib/admin-errors'
import { warningsEqual } from '@/lib/admin-defaults'
import { useAdminEdge } from '@/context/AdminEdgeContext'

type UseAdminPanelLoadOptions<T> = {
  scope: string
  /** When this value changes, data is re-fetched (e.g. search query). */
  reloadKey?: string | number
  load: () => Promise<AdminApiResult<T>>
  empty: T
  /** Initial load shows skeleton; refetches keep previous data visible */
  showSkeletonOnRefetch?: boolean
}

function applyIfChanged<T>(prev: T, next: T, equal: (a: T, b: T) => boolean): T {
  return equal(prev, next) ? prev : next
}

/**
 * Stable admin panel data loading — avoids infinite loops from inline callbacks / fresh empty objects.
 */
export function useAdminPanelLoad<T>({
  scope,
  reloadKey = 'initial',
  load,
  empty,
  showSkeletonOnRefetch = false,
}: UseAdminPanelLoadOptions<T>) {
  const { reportOffline } = useAdminEdge()
  const [data, setData] = useState<T>(empty)
  const [loading, setLoading] = useState(true)
  const [warnings, setWarnings] = useState<string[]>([])
  const [authError, setAuthError] = useState<string | null>(null)
  const [loadId, setLoadId] = useState(0)

  const loadRef = useRef(load)
  loadRef.current = load

  const emptyRef = useRef(empty)
  emptyRef.current = empty

  const loadCountRef = useRef(0)
  const mountedRef = useRef(true)
  const inFlightRef = useRef(false)
  const pendingReloadRef = useRef(false)
  const reportOfflineRef = useRef(reportOffline)
  reportOfflineRef.current = reportOffline

  const runLoad = useCallback(async (options?: { silent?: boolean }) => {
    if (inFlightRef.current) {
      pendingReloadRef.current = true
      return
    }
    inFlightRef.current = true

    const isFirstLoad = loadCountRef.current === 0
    const showLoading = !options?.silent && (showSkeletonOnRefetch || isFirstLoad)

    if (showLoading) setLoading(true)
    setAuthError(null)

    try {
      const result = await loadRef.current()
      if (!mountedRef.current) return

      setData((prev) =>
        JSON.stringify(prev) === JSON.stringify(result.data ?? emptyRef.current)
          ? prev
          : (result.data ?? emptyRef.current),
      )
      setWarnings((prev) =>
        applyIfChanged(prev, result.warnings ?? [], warningsEqual),
      )
      reportOfflineRef.current(result.offline, result.warnings[0] ?? null)
      loadCountRef.current += 1
      setLoadId(loadCountRef.current)
    } catch (err) {
      if (!mountedRef.current) return
      logAdminError(`${scope}.load`, err)
      if (isAdminAuthError(err)) {
        const message = err instanceof Error ? err.message : 'Zugriff verweigert.'
        setAuthError(message)
        setData(emptyRef.current)
        setWarnings([])
      } else {
        setData(emptyRef.current)
        setWarnings([])
        reportOfflineRef.current(
          true,
          err instanceof Error ? err.message : 'Edge Function offline',
        )
      }
    } finally {
      inFlightRef.current = false
      if (mountedRef.current) setLoading(false)
      if (pendingReloadRef.current && mountedRef.current) {
        pendingReloadRef.current = false
        queueMicrotask(() => {
          void runLoad({ silent: true })
        })
      }
    }
  }, [scope, showSkeletonOnRefetch])

  useEffect(() => {
    mountedRef.current = true
    inFlightRef.current = false
    void runLoad()
    return () => {
      mountedRef.current = false
    }
  }, [reloadKey, runLoad])

  const reload = useCallback(() => runLoad({ silent: true }), [runLoad])

  return {
    data,
    loading,
    warnings,
    authError,
    loadId,
    reload,
  }
}
