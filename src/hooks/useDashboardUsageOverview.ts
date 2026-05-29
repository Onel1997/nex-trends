import { useMemo } from 'react'
import { computeTopHookField } from '@/lib/dashboard-activity'
import { getHookAnalyticsEvents } from '@/lib/hook-analytics'
import type { SavedHookRow } from '@/types/ai-generation'

export type DashboardUsageOverview = {
  hooksGenerated: number
  savedHooksCount: number
  creditsUsed: number
  mostUsedTone: { value: string; label: string; count: number } | null
  mostUsedPlatform: { value: string; label: string; count: number } | null
}

type UsageInput = {
  used: number
}

export function useDashboardUsageOverview(
  savedHooks: SavedHookRow[],
  usage: UsageInput,
): DashboardUsageOverview {
  const events = useMemo(() => getHookAnalyticsEvents(), [])

  const hooksGenerated = useMemo(
    () => events.filter((e) => e.type === 'generate' || e.type === 'regenerate').length,
    [events],
  )

  const mostUsedTone = useMemo(
    () => computeTopHookField(savedHooks, events, 'tone'),
    [savedHooks, events],
  )

  const mostUsedPlatform = useMemo(
    () => computeTopHookField(savedHooks, events, 'platform'),
    [savedHooks, events],
  )

  return {
    hooksGenerated,
    savedHooksCount: savedHooks.length,
    creditsUsed: usage.used,
    mostUsedTone,
    mostUsedPlatform,
  }
}
