import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { getRecentActivities } from '@/lib/activity'
import { MAX_FREE_CREDITS } from '@/lib/constants'
import { PLAN_LABELS } from '@/lib/plans'
import { resolveUserPlan } from '@/lib/subscription'
import { startStripePortalFlow } from '@/lib/stripe'
import { formatUsageResetDate } from '@/lib/usage'
import type { ActivityItem, DashboardUser, TrendInsight, WeeklyUsagePoint } from '@/types/dashboard'

const TREND_INSIGHTS: TrendInsight[] = [
  {
    id: '1',
    title: 'POV: Morning Routine Hacks',
    platform: 'TikTok',
    views: '2.4M',
    change: '+18%',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-fuchsia-600',
  },
  {
    id: '2',
    title: 'Quiet Luxury Aesthetic',
    platform: 'Instagram',
    views: '1.1M',
    change: '+12%',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-600',
  },
  {
    id: '3',
    title: 'AI Side Hustle Trends',
    platform: 'TikTok',
    views: '3.8M',
    change: '+24%',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
  },
  {
    id: '4',
    title: '7-Sekunden Transformations',
    platform: 'Instagram',
    views: '890K',
    change: '+9%',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-orange-600',
  },
]

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

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const user: DashboardUser | null = useMemo(() => {
    if (!session?.user) return null

    const email = session.user.email ?? 'Unbekannt'
    const meta = session.user.user_metadata as { full_name?: string; name?: string }
    const name = meta.full_name ?? meta.name ?? email.split('@')[0] ?? 'User'
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return { name, email, avatarInitials: initials || 'NT' }
  }, [session?.user])

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
    : hasProAccess
      ? 'Active'
      : 'Free'
  const remainingLabel =
    isAdmin || hasProAccess
      ? 'Unbegrenzt'
      : `${usage.remaining ?? 0} / ${usage.limit ?? MAX_FREE_CREDITS}`

  const loadActivities = useCallback(() => {
    setActivities(getRecentActivities())
  }, [])

  useEffect(() => {
    loadActivities()
  }, [loadActivities, usage.used])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      await refreshProfile()
      loadActivities()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dashboard konnte nicht geladen werden')
    }
  }, [refreshProfile, loadActivities])

  const manageSubscription = useCallback(() => {
    const portalUrl = import.meta.env.VITE_STRIPE_PORTAL_URL
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

  return {
    user,
    profile,
    isLoading: !isReady || isProfileLoading,
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
    trendInsights: TREND_INSIGHTS,
    refresh,
    openUpgradeModal,
    openStripeCheckout,
    manageSubscription,
  }
}
