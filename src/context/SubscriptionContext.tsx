import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { startStripeCheckoutFlow } from '@/lib/stripe'
import {
  clearProfileCache,
  getDefaultProfile,
  hasProAccess,
  readProfileCache,
  writeProfileCache,
} from '@/lib/subscription'
import { useToast } from '@/context/ToastContext'
import { logActivity } from '@/lib/activity'
import {
  checkUsageLimit as fetchUsageLimit,
  getUsageFromProfile,
  incrementUsage as fetchIncrementUsage,
} from '@/lib/usage'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/subscription'
import type { UsageLimitResult } from '@/types/usage'

type SubscriptionContextValue = {
  session: Session | null
  profile: UserProfile | null
  isAuthLoading: boolean
  isProfileLoading: boolean
  isReady: boolean
  hasProAccess: boolean
  usage: UsageLimitResult
  isUsageLimitReached: boolean
  refreshProfile: () => Promise<void>
  refreshUsage: () => Promise<UsageLimitResult>
  consumeUsage: (
    activity?: { tool: string; label: string },
  ) => Promise<UsageLimitResult>
  isUpgradeModalOpen: boolean
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
  openStripeCheckout: () => Promise<void>
}

export const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
)

type SubscriptionProviderProps = {
  children: ReactNode
}

function applyUsageToProfile(
  profile: UserProfile,
  usage: UsageLimitResult,
): UserProfile {
  return {
    ...profile,
    monthly_usage_count: usage.used,
    usage_reset_date: usage.usageResetDate,
  }
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { showToast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usage, setUsage] = useState<UsageLimitResult>(getUsageFromProfile(null))
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  const profileRef = useRef<UserProfile | null>(null)
  profileRef.current = profile

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'is_pro, subscription_status, stripe_customer_id, stripe_subscription_id, monthly_usage_count, usage_reset_date',
      )
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profil laden fehlgeschlagen:', error)
      return profileRef.current ?? getDefaultProfile()
    }

    const next: UserProfile = {
      is_pro: data.is_pro === true,
      subscription_status:
        data.subscription_status === 'active' ? 'active' : 'inactive',
      stripe_customer_id: data.stripe_customer_id ?? null,
      stripe_subscription_id: data.stripe_subscription_id ?? null,
      monthly_usage_count: data.monthly_usage_count ?? 0,
      usage_reset_date: data.usage_reset_date ?? null,
    }

    writeProfileCache(userId, next)
    return next
  }, [])

  const syncUsageFromServer = useCallback(async () => {
    try {
      const serverUsage = await fetchUsageLimit(profileRef.current)
      setUsage(serverUsage)
      const userId = session?.user?.id
      if (userId && profileRef.current) {
        const nextProfile = applyUsageToProfile(profileRef.current, serverUsage)
        setProfile(nextProfile)
        writeProfileCache(userId, nextProfile)
      }
      return serverUsage
    } catch (err) {
      console.error('Usage-Check fehlgeschlagen:', err)
      const fallback = getUsageFromProfile(profileRef.current)
      setUsage(fallback)
      return fallback
    }
  }, [session?.user?.id])

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) return

    setIsProfileLoading(true)
    try {
      const next = await fetchProfile(userId)
      setProfile(next)
      await syncUsageFromServer()
    } finally {
      setIsProfileLoading(false)
    }
  }, [session?.user?.id, fetchProfile, syncUsageFromServer])

  const loadProfileForUser = useCallback(
    async (userId: string, options?: { showLoading?: boolean }) => {
      const cached = readProfileCache(userId)
      if (cached) {
        setProfile(cached)
        setUsage(getUsageFromProfile(cached))
      }

      if (options?.showLoading !== false && !cached) {
        setIsProfileLoading(true)
      }

      try {
        const next = await fetchProfile(userId)
        setProfile(next)
        setUsage(getUsageFromProfile(next))
        await syncUsageFromServer()
      } finally {
        setIsProfileLoading(false)
      }
    },
    [fetchProfile, syncUsageFromServer],
  )

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return
      setSession(initialSession)
      setIsAuthLoading(false)

      if (initialSession?.user?.id) {
        void loadProfileForUser(initialSession.user.id)
      } else {
        setProfile(null)
        setUsage(getUsageFromProfile(null))
        clearProfileCache()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsAuthLoading(false)

      if (nextSession?.user?.id) {
        void loadProfileForUser(nextSession.user.id)
      } else {
        setProfile(null)
        setUsage(getUsageFromProfile(null))
        clearProfileCache()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfileForUser])

  const handleStripeCheckout = useCallback(async () => {
    try {
      await startStripeCheckoutFlow()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Checkout konnte nicht gestartet werden.'

      showToast({
        type: 'error',
        title: 'Checkout fehlgeschlagen',
        message,
        durationMs: 7000,
      })
    }
  }, [showToast])

  const proAccess = hasProAccess(profile)

  const consumeUsage = useCallback(
    async (
      activity?: { tool: string; label: string },
    ): Promise<UsageLimitResult> => {
      if (proAccess) {
        if (activity) logActivity(activity.tool, activity.label)
        const unlimited = getUsageFromProfile(profile)
        return { ...unlimited, allowed: true, unlimited: true }
      }

      try {
        const result = await fetchIncrementUsage(profileRef.current)
        setUsage(result)

        if (result.allowed && activity) {
          logActivity(activity.tool, activity.label)
        }

        const userId = session?.user?.id
        if (userId) {
          setProfile((prev) => {
            const base = prev ?? getDefaultProfile()
            const next = applyUsageToProfile(base, result)
            writeProfileCache(userId, next)
            return next
          })
        }

        return result
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Usage-Limit konnte nicht aktualisiert werden.'

        showToast({
          type: 'error',
          title: 'Anfrage fehlgeschlagen',
          message,
          durationMs: 7000,
        })

        const fallback = getUsageFromProfile(profileRef.current)
        setUsage(fallback)
        return { ...fallback, allowed: false }
      }
    },
    [proAccess, profile, session?.user?.id, showToast],
  )

  const isReady =
    !isAuthLoading && (!session?.user?.id || profile !== null)

  const isUsageLimitReached = !usage.unlimited && !usage.allowed

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      session,
      profile,
      isAuthLoading,
      isProfileLoading,
      isReady,
      hasProAccess: proAccess,
      usage,
      isUsageLimitReached,
      refreshProfile,
      refreshUsage: syncUsageFromServer,
      consumeUsage,
      isUpgradeModalOpen,
      openUpgradeModal: () => setIsUpgradeModalOpen(true),
      closeUpgradeModal: () => setIsUpgradeModalOpen(false),
      openStripeCheckout: handleStripeCheckout,
    }),
    [
      session,
      profile,
      isAuthLoading,
      isProfileLoading,
      isReady,
      proAccess,
      usage,
      isUsageLimitReached,
      refreshProfile,
      syncUsageFromServer,
      consumeUsage,
      isUpgradeModalOpen,
      handleStripeCheckout,
    ],
  )

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}
