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
import { getAdminUsageResult, isAdminEmail } from '@/lib/admin'
import {
  clearProfileCache,
  getDefaultProfile,
  hasProAccess as profileHasProAccess,
  hasUnlimitedCredits,
  readProfileCache,
  writeProfileCache,
} from '@/lib/subscription'
import { useToast } from '@/context/ToastContext'
import { logActivity } from '@/lib/activity'
import {
  checkUsageLimit as fetchUsageLimit,
  getUsageFromProfile,
  incrementUsage as fetchIncrementUsage,
  logGenerationUsage,
  type UsageGenerationMeta,
} from '@/lib/usage'
import { supabase } from '@/lib/supabase'
import { normalizePlanId, type BillingPeriod, type PlanId } from '@/lib/plans'
import type { UserProfile } from '@/types/subscription'
import type { UsageLimitResult } from '@/types/usage'

type ConsumeUsageOptions = {
  tool: string
  label: string
  cost?: number
  niche?: string
  platform?: string
  prompt?: string
  generation_type?: 'text' | 'video' | 'audio' | 'search' | 'image'
  skip_analytics_log?: boolean
}

type SubscriptionContextValue = {
  session: Session | null
  profile: UserProfile | null
  isAuthLoading: boolean
  isProfileLoading: boolean
  isReady: boolean
  hasProAccess: boolean
  isAdmin: boolean
  usage: UsageLimitResult
  isUsageLimitReached: boolean
  isCreditsLow: boolean
  refreshProfile: () => Promise<void>
  refreshUsage: () => Promise<UsageLimitResult>
  consumeUsage: (activity?: ConsumeUsageOptions) => Promise<UsageLimitResult>
  isUpgradeModalOpen: boolean
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
  openStripeCheckout: (options?: {
    planId?: PlanId
    billingPeriod?: BillingPeriod
  }) => Promise<void>
  userPlan: PlanId
}

export const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
)

type SubscriptionProviderProps = {
  children: ReactNode
}

const PROFILE_SELECT =
  'plan, is_pro, subscription_status, stripe_customer_id, stripe_subscription_id, credit_balance, monthly_usage_count, last_weekly_refill_at, usage_reset_date, billing_period'

function mapProfileRow(data: Record<string, unknown>): UserProfile {
  return {
    plan: normalizePlanId(data.plan as string | null),
    is_pro: data.is_pro === true,
    subscription_status:
      data.subscription_status === 'active' ? 'active' : 'inactive',
    stripe_customer_id: (data.stripe_customer_id as string | null) ?? null,
    stripe_subscription_id: (data.stripe_subscription_id as string | null) ?? null,
    credit_balance: (data.credit_balance as number | null) ?? getDefaultProfile().credit_balance,
    monthly_usage_count: (data.monthly_usage_count as number | null) ?? 0,
    last_weekly_refill_at: (data.last_weekly_refill_at as string | null) ?? null,
    usage_reset_date: (data.usage_reset_date as string | null) ?? null,
    billing_period:
      data.billing_period === 'yearly' ? 'yearly' : 'monthly',
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

  const userEmail = session?.user?.email ?? null
  const isAdmin = isAdminEmail(userEmail)

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
    if (isAdminEmail(session?.user?.email)) {
      const adminUsage = getAdminUsageResult(
        profileRef.current?.monthly_usage_count ?? 0,
        profileRef.current?.usage_reset_date ?? null,
      )
      setUsage(adminUsage)
      return adminUsage
    }

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
      const fallback = getUsageFromProfile(profileRef.current, session?.user?.email)
      setUsage(fallback)
      return fallback
    }
  }, [session?.user?.email, session?.user?.id])

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
        setUsage(getUsageFromProfile(cached, session?.user?.email))
      }

      if (options?.showLoading !== false && !cached) {
        setIsProfileLoading(true)
      }

      try {
        const next = await fetchProfile(userId)
        setProfile(next)
        setUsage(getUsageFromProfile(next, session?.user?.email))
        await syncUsageFromServer()
      } finally {
        setIsProfileLoading(false)
      }
    },
    [fetchProfile, session?.user?.email, syncUsageFromServer],
  )

  useEffect(() => {
    let mounted = true

    async function bootstrapAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(initialSession)
        setIsAuthLoading(false)

        if (initialSession?.user?.id) {
          void loadProfileForUser(initialSession.user.id)
        } else {
          setProfile(null)
          setUsage(getUsageFromProfile(null, null))
          clearProfileCache()
        }
      } catch (error) {
        console.error('[auth] Failed to bootstrap session:', error)
        if (!mounted) return
        setSession(null)
        setIsAuthLoading(false)
        setProfile(null)
        setUsage(getUsageFromProfile(null, null))
        clearProfileCache()
      }
    }

    void bootstrapAuth()

    let subscription: { unsubscribe: () => void } | undefined

    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession((prev) => {
        const sameUser = prev?.user?.id === nextSession?.user?.id
        const sameToken = prev?.access_token === nextSession?.access_token
        if (sameUser && sameToken) return prev
        return nextSession
      })
      setIsAuthLoading(false)

      // Token refresh must not reload profile / re-render the whole app tree
      if (event === 'TOKEN_REFRESHED') return

      if (nextSession?.user?.id) {
        void loadProfileForUser(nextSession.user.id)
      } else {
        setProfile(null)
        setUsage(getUsageFromProfile(null, null))
        clearProfileCache()
      }
    })

      subscription = authSubscription
    } catch (error) {
      console.error('[auth] Failed to subscribe to auth state:', error)
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [loadProfileForUser])

  const handleStripeCheckout = useCallback(
    async (options?: { planId?: PlanId; billingPeriod?: BillingPeriod }) => {
    try {
      await startStripeCheckoutFlow({
        planId: options?.planId,
        billingPeriod: options?.billingPeriod,
      })
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

  const userPlan = normalizePlanId(
    isAdmin ? 'founder' : profile?.plan,
  )
  const paidProAccess = profileHasProAccess(profile)
  const unlimitedCredits = hasUnlimitedCredits(profile, userEmail)

  const consumeUsage = useCallback(
    async (activity?: ConsumeUsageOptions): Promise<UsageLimitResult> => {
      const generationMeta: UsageGenerationMeta | undefined = activity
        ? {
            tool: activity.tool,
            label: activity.label,
            niche: activity.niche,
            platform: activity.platform,
            prompt: activity.prompt ?? activity.label,
            credits_used: activity.cost ?? 1,
            generation_type: activity.generation_type,
            skip_analytics_log: activity.skip_analytics_log,
          }
        : undefined

      if (isAdmin) {
        if (activity) {
          logActivity(activity.tool, activity.label)
          void logGenerationUsage(generationMeta!)
        }
        const unlimited = getAdminUsageResult(
          profileRef.current?.monthly_usage_count ?? 0,
          profileRef.current?.usage_reset_date ?? null,
        )
        setUsage(unlimited)
        return unlimited
      }

      if (unlimitedCredits) {
        if (activity) {
          logActivity(activity.tool, activity.label)
          void logGenerationUsage(generationMeta!)
        }
        const unlimited = getUsageFromProfile(profile, userEmail)
        setUsage({ ...unlimited, allowed: true, unlimited: true })
        return { ...unlimited, allowed: true, unlimited: true }
      }

      try {
        const result = await fetchIncrementUsage(
          profileRef.current,
          activity?.cost ?? 1,
          generationMeta,
        )
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

        const fallback = getUsageFromProfile(profileRef.current, userEmail)
        setUsage(fallback)
        return { ...fallback, allowed: false }
      }
    },
    [isAdmin, unlimitedCredits, profile, userEmail, session?.user?.id, showToast],
  )

  useEffect(() => {
    if (isAdmin && isUpgradeModalOpen) {
      setIsUpgradeModalOpen(false)
    }
  }, [isAdmin, isUpgradeModalOpen])

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
      hasProAccess: paidProAccess,
      userPlan,
      isAdmin,
      usage,
      isUsageLimitReached,
      isCreditsLow,
      refreshProfile,
      refreshUsage: syncUsageFromServer,
      consumeUsage,
      isUpgradeModalOpen,
      openUpgradeModal: () => {
        if (isAdmin) return
        setIsUpgradeModalOpen(true)
      },
      closeUpgradeModal: () => setIsUpgradeModalOpen(false),
      openStripeCheckout: handleStripeCheckout,
    }),
    [
      session,
      profile,
      isAuthLoading,
      isProfileLoading,
      isReady,
      paidProAccess,
      unlimitedCredits,
      userPlan,
      isAdmin,
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
