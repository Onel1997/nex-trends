import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useSavedTrends } from '@/hooks/useSavedTrends'
import { getRecentActivities } from '@/lib/activity'
import {
  fetchRecentActivityFromSupabase,
  syncLocalActivitiesToSupabase,
} from '@/lib/dashboard-activity-api'
import { getMergedDashboardActivity } from '@/lib/dashboard-activity'
import { buildTrendInsightsFromSaved } from '@/lib/dashboard-insights'
import {
  fetchDashboardProfileFields,
  resolveDashboardUserDisplay,
} from '@/lib/dashboard-profile'
import { PLAN_LABELS } from '@/lib/plans'
import { formatUiCreditBalance, getUiCreditSnapshot } from '@/lib/credits/display'
import { resolveUserPlan } from '@/lib/subscription'
import { startStripePortalFlow } from '@/lib/stripe'
import { formatUsageResetDate } from '@/lib/usage'
import { readEnv } from '@/lib/env'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { ActivityItem, DashboardUser, TrendInsight, WeeklyUsagePoint } from '@/types/dashboard'

function mergeActivityFeeds(remote: ActivityItem[], local: ActivityItem[]): ActivityItem[] {
  const merged = [...remote, ...local].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  const seen = new Set<string>()
  const deduped: ActivityItem[] = []
  for (const item of merged) {
    const key = `${item.kind ?? ''}|${item.tool}|${item.label}|${item.timestamp.slice(0, 16)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
    if (deduped.length >= 12) break
  }
  return deduped
}

export function useDashboardData() {
  const {
    session,
    profile,
    isReady,
    isProfileLoading,
    hasProAccess,
    isAdmin,
    usage,
    refreshProfile,
    openUpgradeModal,
    openStripeCheckout,
  } = useSubscription()

  const { savedTrends, isLoading: savedTrendsLoading } = useSavedTrends()

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [profileFields, setProfileFields] = useState<Awaited<
    ReturnType<typeof fetchDashboardProfileFields>
  > | null>(null)
  const [profileFieldsLoading, setProfileFieldsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activitySyncedRef = useRef(false)

  const user: DashboardUser | null = useMemo(() => {
    if (!session?.user) return null

    const display = resolveDashboardUserDisplay(session.user, profileFields)
    const initials = display.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return {
      name: display.name,
      email: display.email,
      avatarInitials: initials || 'NT',
      avatarUrl: display.avatarUrl,
    }
  }, [session?.user, profileFields])

  const weeklyUsage: WeeklyUsagePoint[] = useMemo(() => {
    const used = usage.used
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    const today = new Date().getDay()
    const mondayOffset = today === 0 ? 6 : today - 1

    return days.map((label, index) => {
      if (index < mondayOffset) {
        const spread = Math.max(0, Math.round(used / Math.max(mondayOffset, 1)))
        return { label, value: index === mondayOffset - 1 ? used - spread * (mondayOffset - 1) : spread }
      }
      if (index === mondayOffset) return { label, value: used > 0 ? Math.max(1, used) : 0 }
      return { label, value: 0 }
    })
  }, [usage.used])

  const userPlan = resolveUserPlan(profile, session?.user?.email)
  const planLabel = isAdmin ? PLAN_LABELS.founder : PLAN_LABELS[userPlan]
  const statusLabel = isAdmin
    ? 'FOUNDER'
    : usage.unlimited
      ? 'Active'
      : 'Free'
  const creditSnapshot = getUiCreditSnapshot(userPlan, usage, isAdmin)
  const remainingLabel = formatUiCreditBalance(creditSnapshot)

  const trendInsights: TrendInsight[] = useMemo(
    () => buildTrendInsightsFromSaved(savedTrends),
    [savedTrends],
  )

  const loadProfileFields = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId || !isSupabaseConfigured()) {
      setProfileFields(null)
      setProfileFieldsLoading(false)
      return
    }

    setProfileFieldsLoading(true)
    try {
      const fields = await fetchDashboardProfileFields(userId)
      setProfileFields(fields)
    } finally {
      setProfileFieldsLoading(false)
    }
  }, [session?.user?.id])

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true)
    try {
      const userId = session?.user?.id
      const localMerged = getMergedDashboardActivity()

      if (!userId || !isSupabaseConfigured()) {
        setActivities(localMerged)
        return
      }

      if (!activitySyncedRef.current) {
        const localOnly = getRecentActivities()
        if (localOnly.length > 0) {
          await syncLocalActivitiesToSupabase(userId, localOnly)
        }
        activitySyncedRef.current = true
      }

      const remote = await fetchRecentActivityFromSupabase(userId)
      setActivities(mergeActivityFeeds(remote, localMerged))
    } catch {
      setActivities(getMergedDashboardActivity())
    } finally {
      setActivitiesLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    void loadProfileFields()
  }, [loadProfileFields])

  useEffect(() => {
    void loadActivities()
  }, [loadActivities, usage.used])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      await refreshProfile()
      await loadProfileFields()
      await loadActivities()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dashboard konnte nicht geladen werden')
    }
  }, [refreshProfile, loadProfileFields, loadActivities])

  const manageSubscription = useCallback(() => {
    const portalUrl = readEnv('VITE_STRIPE_PORTAL_URL')
    if (portalUrl?.trim()) {
      window.open(portalUrl, '_blank')
      return
    }
    if (hasProAccess) {
      void startStripePortalFlow()
      return
    }
    openUpgradeModal()
  }, [hasProAccess, openUpgradeModal])

  const isLoading =
    !isReady ||
    isProfileLoading ||
    profileFieldsLoading ||
    savedTrendsLoading ||
    activitiesLoading

  return {
    user,
    profile,
    userPlan,
    isLoading,
    error,
    hasProAccess,
    isAdmin,
    usage,
    planLabel,
    statusLabel,
    remainingLabel,
    resetDateLabel: formatUsageResetDate(usage.usageResetDate),
    weeklyUsage,
    activities,
    activitiesLoading,
    trendInsights,
    trendInsightsLoading: savedTrendsLoading,
    savedTrends,
    refresh,
    openUpgradeModal,
    openStripeCheckout,
    manageSubscription,
  }
}
