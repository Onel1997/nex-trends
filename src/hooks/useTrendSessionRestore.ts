import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScoutPlatform } from '@/components/trends/TrendScoutSearch'
import type { TrendsView } from '@/components/trends/TrendsTabNav'
import {
  getDashboardScrollElement,
  loadTrendSession,
  saveTrendSession,
  type PersistedTrendSession,
} from '@/lib/trend-session-storage'
import { markDemoSeen } from '@/lib/trend-intelligence'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendSessionSnapshot = {
  searchQuery: string
  platform: ScoutPlatform
  trends: TrendIntelligence[]
  isDemo: boolean
  view: TrendsView
}

function toSnapshot(saved: PersistedTrendSession): TrendSessionSnapshot {
  return {
    searchQuery: saved.searchQuery,
    platform: saved.platform,
    trends: saved.trends,
    isDemo: saved.isDemo,
    view: saved.view,
  }
}

type RestoreBootstrap = {
  initial: TrendSessionSnapshot | null
  isRestoring: boolean
  scrollTop: number
}

function readBootstrap(): RestoreBootstrap {
  const saved = loadTrendSession()
  if (!saved) {
    return { initial: null, isRestoring: false, scrollTop: 0 }
  }
  markDemoSeen()
  return {
    initial: toSnapshot(saved),
    isRestoring: true,
    scrollTop: saved.scrollTop,
  }
}

type UseTrendSessionRestoreResult = {
  isRestoring: boolean
  initial: TrendSessionSnapshot | null
  persist: (snapshot: TrendSessionSnapshot) => void
  restoreScroll: () => void
}

export function useTrendSessionRestore(): UseTrendSessionRestoreResult {
  const [{ initial, isRestoring: startRestoring, scrollTop }] = useState(readBootstrap)
  const [isRestoring, setIsRestoring] = useState(startRestoring)
  const savedScrollRef = useRef(scrollTop)
  const hydratedRef = useRef(false)

  useEffect(() => {
    hydratedRef.current = true
    if (startRestoring) {
      queueMicrotask(() => setIsRestoring(false))
    }
  }, [startRestoring])

  const restoreScroll = useCallback(() => {
    const top = savedScrollRef.current
    if (top <= 0) return

    const apply = () => {
      const main = getDashboardScrollElement()
      if (main) main.scrollTop = top
    }

    requestAnimationFrame(() => {
      apply()
      requestAnimationFrame(apply)
    })
  }, [])

  const persist = useCallback((snapshot: TrendSessionSnapshot) => {
    if (!hydratedRef.current) return

    const main = getDashboardScrollElement()
    const scrollTop = main?.scrollTop ?? 0
    savedScrollRef.current = scrollTop

    saveTrendSession({
      ...snapshot,
      scrollTop,
    })
  }, [])

  useEffect(() => {
    if (!hydratedRef.current) return

    const main = getDashboardScrollElement()
    if (!main) return

    let timeout: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        savedScrollRef.current = main.scrollTop
      }, 150)
    }

    main.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timeout)
      main.removeEventListener('scroll', onScroll)
    }
  }, [])

  return { isRestoring, initial, persist, restoreScroll }
}
