import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { navigateFromAdminToDashboard } from '@/lib/admin-navigation'
import { navigateToLanding } from '@/lib/navigation'

type AdminGuardState = {
  isReady: boolean
  isAllowed: boolean
}

export function useAdminGuard(): AdminGuardState {
  const { session, isAdmin, isAuthLoading, isReady: subscriptionReady } = useSubscription()
  const [redirected, setRedirected] = useState(false)

  const isReady = !isAuthLoading && subscriptionReady
  const isAllowed = Boolean(session && isAdmin)

  useEffect(() => {
    if (!isReady || redirected) return

    if (!session) {
      setRedirected(true)
      navigateToLanding()
      return
    }

    if (!isAdmin) {
      setRedirected(true)
      navigateFromAdminToDashboard()
    }
  }, [isReady, session, isAdmin, redirected])

  return { isReady, isAllowed: isAllowed && !redirected }
}
