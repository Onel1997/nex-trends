'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen'
import { AUTH_LOGIN_PATH } from '@/lib/auth'
import { useSubscription } from '@/hooks/useSubscription'
import { isSupabaseConfigured } from '@/lib/supabase'

type AuthGuardProps = {
  children: ReactNode
}

/**
 * Client-side dashboard protection — complements middleware session checks.
 * Redirects unauthenticated users to /login while preserving the intended path.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { session, isAuthLoading } = useSubscription()
  const redirectStarted = useRef(false)

  useEffect(() => {
    if (isAuthLoading) return
    if (!isSupabaseConfigured()) return

    if (session?.user) {
      redirectStarted.current = false
      return
    }

    if (redirectStarted.current) return
    redirectStarted.current = true

    const next =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '/dashboard'

    const loginUrl = `${AUTH_LOGIN_PATH}?next=${encodeURIComponent(next)}`
    router.replace(loginUrl)
  }, [isAuthLoading, session?.user, router])

  if (!isSupabaseConfigured()) {
    return <>{children}</>
  }

  if (isAuthLoading) {
    return <AuthLoadingScreen title="Dashboard wird geladen …" />
  }

  if (!session?.user) {
    return <AuthLoadingScreen title="Weiterleitung zur Anmeldung …" />
  }

  return <>{children}</>
}
