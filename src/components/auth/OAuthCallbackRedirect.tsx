'use client'

import { useEffect } from 'react'
import { AUTH_CALLBACK_PATH, isAuthCallbackPath } from '@/lib/auth'

/**
 * When Supabase redirects to Site URL (e.g. `/?code=...`) instead of `/auth/callback`,
 * forward OAuth query params to the dedicated callback route for PKCE exchange.
 */
export function OAuthCallbackRedirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isAuthCallbackPath()) return

    const url = new URL(window.location.href)
    const hasCode = url.searchParams.has('code')
    const hasOAuthError =
      url.searchParams.has('error') || url.searchParams.has('error_description')
    if (!hasCode && !hasOAuthError) return

    const callback = new URL(AUTH_CALLBACK_PATH, url.origin)
    for (const key of ['code', 'state', 'error', 'error_description'] as const) {
      const value = url.searchParams.get(key)
      if (value) callback.searchParams.set(key, value)
    }

    window.location.replace(callback.toString())
  }, [])

  return null
}
