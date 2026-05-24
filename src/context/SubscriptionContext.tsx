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

type ConsumeUsageOptions = {
  tool: string
  label: string
  cost?: number
}

type SubscriptionContextValue = {
  session: Session | null
  profile: UserProfile | null
  isAuthLoading: boolean
  isProfileLoading: boolean
  isReady: boolean
  hasProAccess: boolean
  usage: UsageLimitResult
  isUsageLimitReached: boolean
  isCreditsLow: boolean
  refreshProfile: () => Promise<void>
  refreshUsage: () => Promise<UsageLimitResult>
  consumeUsage: (activity?: ConsumeUsageOptions) => Promise<UsageLimitResult>
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

const PROFILE_SELECT =
  'is_pro, subscription_status, stripe_customer_id, stripe_subscription_id, credit_balance, monthly_usage_count, last_weekly_refill_at, usage_reset_date'

function mapProfileRow(data: Record<string, unknown>): UserProfile {
  return {
    is_pro: data.is_pro === true,
    subscription_status:
      data.subscription_status === 'active' ? 'active' : 'inactive',
    stripe_customer_id: (data.stripe_customer_id as string | null) ?? null,
    stripe_subscription_id: (data.stripe_subscription_id as string | null) ?? null,
    credit_balance: (data.credit_balance as number | null) ?? getDefaultProfile().credit_balance,
    monthly_usage_count: (data.monthly_usage_count as number | null) ?? 0,
    last_weekly_refill_at: (data.last_weekly_refill_at as string | null) ?? null,
    usage_reset_date: (data.usage_reset_date as string | null) ?? null,
  }
}

function applyUsageToProfile(
  profile: UserProfile,
  usage: UsageLimitResult,
): UserProfile {
  return {
    ...profile,
    credit_balance: usage.remaining ?? profile.credit_balance,
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
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle()

    if (data && !error) {
      const next = mapProfileRow(data)
      writeProfileCache(userId, next)
      return next
    }

    if (error) {
      console.error('Profil laden fehlgeschlagen:', error)
    }

    try {
      await fetchUsageLimit()
      const { data: retryData, error: retryError } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .eq('id', userId)
        .maybeSingle()

      if (retryData && !retryError) {
        const next = mapProfileRow(retryData)
        writeProfileCache(userId, next)
        return next
      }
    } catch (ensureErr) {
      console.error('Profil konnte nicht angelegt werden:', ensureErr)
    }

    const fallback = profileRef.current ?? getDefaultProfile()
    writeProfileCache(userId, fallback)
    return fallback
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
    async (activity?: ConsumeUsageOptions): Promise<UsageLimitResult> => {
      if (proAccess) {
        if (activity) logActivity(activity.tool, activity.label)
        const unlimited = getUsageFromProfile(profile)
        return { ...unlimited, allowed: true, unlimited: true }
      }

      try {
        const result = await fetchIncrementUsage(profileRef.current, activity?.cost ?? 1)
        setUsage(result)

        if (result.allowed && activity) {
          logActivity(activity.tool, activity.label)
        }

        if (!result.allowed && (result.remaining ?? 0) <= 0) {
          setIsUpgradeModalOpen(true)
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

  const remainingCredits = usage.remaining ?? 0
  const isUsageLimitReached = !usage.unlimited && remainingCredits <= 0
  const isCreditsLow = !usage.unlimited && remainingCredits > 0 && remainingCredits <= 3

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
      isCreditsLow,
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
      isCreditsLow,
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
