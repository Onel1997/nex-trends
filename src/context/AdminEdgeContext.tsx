import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { probeAdminApi } from '@/lib/admin-api'
import { logAdminDebug } from '@/lib/admin-errors'

type AdminEdgeContextValue = {
  isOffline: boolean
  isChecking: boolean
  offlineMessage: string | null
  /** Updates offline state only when values change (prevents rerender loops). */
  reportOffline: (offline: boolean, message?: string | null) => void
  recheck: () => Promise<void>
}

const AdminEdgeContext = createContext<AdminEdgeContextValue | null>(null)

export function AdminEdgeProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null)
  const offlineRef = useRef({ offline: false, message: null as string | null })

  const reportOffline = useCallback((offline: boolean, message?: string | null) => {
    const nextMessage = offline ? (message ?? offlineRef.current.message) : null
    if (
      offlineRef.current.offline === offline &&
      offlineRef.current.message === nextMessage
    ) {
      return
    }
    offlineRef.current = { offline, message: nextMessage }
    setIsOffline(offline)
    setOfflineMessage(nextMessage)
  }, [])

  const recheck = useCallback(async () => {
    setIsChecking(true)
    logAdminDebug('AdminEdgeProvider.recheck')
    try {
      const probe = await probeAdminApi()
      reportOffline(probe.offline, probe.offline ? (probe.message ?? null) : null)
    } finally {
      setIsChecking(false)
    }
  }, [reportOffline])

  const recheckRef = useRef(recheck)
  recheckRef.current = recheck

  useEffect(() => {
    void recheckRef.current()
  }, [])

  const value = useMemo(
    () => ({
      isOffline,
      isChecking,
      offlineMessage,
      reportOffline,
      recheck,
    }),
    [isOffline, isChecking, offlineMessage, reportOffline, recheck],
  )

  return (
    <AdminEdgeContext.Provider value={value}>{children}</AdminEdgeContext.Provider>
  )
}

export function useAdminEdge(): AdminEdgeContextValue {
  const ctx = useContext(AdminEdgeContext)
  if (!ctx) {
    throw new Error('useAdminEdge must be used within AdminEdgeProvider')
  }
  return ctx
}
