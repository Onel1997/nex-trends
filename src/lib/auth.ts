import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { scrollToSection } from '@/lib/scroll'

export function getAppOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

/** OAuth redirect URL based on the current browser origin (localhost, LAN IP, production). */
export function getAuthRedirectUrl(path = '/'): string {
  const origin = getAppOrigin()
  if (!origin) return path.startsWith('/') ? path : `/${path}`

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalizedPath}`
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
}

export async function signInWithGoogle(options?: { redirectPath?: string }) {
  const redirectTo = getAuthRedirectUrl(options?.redirectPath ?? '/')

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
}

export function scrollToLogin() {
  scrollToSection('login')
}
