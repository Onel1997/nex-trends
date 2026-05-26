import { useEffect, useState } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { scrollToSection } from '@/lib/scroll'

export type AuthActionResult = {
  error: AuthError | null
  message: string | null
}

/** Dedicated OAuth callback path — must match Supabase redirect allow-list entries. */
export const AUTH_CALLBACK_PATH = '/auth/callback'

/** Origin the user actually loaded (LAN IP on mobile, localhost on desktop). */
export function getAppOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export function isAuthCallbackPath(pathname = window.location.pathname): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return normalized === AUTH_CALLBACK_PATH
}

/**
 * Google OAuth redirect URL — always `${window.location.origin}/auth/callback`.
 * Never hardcodes 127.0.0.1; uses whatever host the user opened.
 */
export function getGoogleOAuthRedirectUrl(): string {
  const origin = getAppOrigin()
  if (!origin) return AUTH_CALLBACK_PATH
  return `${origin}${AUTH_CALLBACK_PATH}`
}

/**
 * Build redirect URLs from the current browser origin.
 */
export function getAuthRedirectUrl(path = '/'): string {
  const origin = getAppOrigin()
  if (!origin) {
    return path.startsWith('/') ? path : `/${path}`
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  try {
    return new URL(normalizedPath, origin).href
  } catch {
    return `${origin}${normalizedPath}`
  }
}

/** Strip OAuth query params after session exchange on the callback route. */
export function cleanAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  const authParams = [
    'code',
    'state',
    'error',
    'error_description',
    'access_token',
    'refresh_token',
    'type',
  ]
  let changed = false

  for (const key of authParams) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }

  if (url.hash.includes('access_token') || url.hash.includes('error')) {
    url.hash = ''
    changed = true
  }

  if (changed) {
    const next = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState({}, '', next || AUTH_CALLBACK_PATH)
  }
}

/**
 * Exchange PKCE OAuth code on /auth/callback.
 */
export async function completeAuthCallback(): Promise<AuthActionResult> {
  if (typeof window === 'undefined') {
    return { error: null, message: null }
  }

  const url = new URL(window.location.href)
  const oauthError =
    url.searchParams.get('error_description') ?? url.searchParams.get('error')
  if (oauthError) {
    cleanAuthParamsFromUrl()
    return {
      error: { message: oauthError, name: 'AuthCallbackError', status: 400 } as AuthError,
      message: oauthError,
    }
  }

  const code = url.searchParams.get('code')
  if (!code) {
    return {
      error: {
        message: 'Kein Autorisierungscode erhalten.',
        name: 'AuthCallbackError',
        status: 400,
      } as AuthError,
      message: 'Kein Autorisierungscode erhalten. Bitte erneut anmelden.',
    }
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  cleanAuthParamsFromUrl()

  if (error) {
    return { error, message: formatAuthError(error) }
  }

  return { error: null, message: null }
}

/** @deprecated Use completeAuthCallback on /auth/callback only. */
export async function initializeAuthCallback(): Promise<AuthActionResult> {
  if (!isAuthCallbackPath()) {
    return { error: null, message: null }
  }
  return completeAuthCallback()
}

export function formatAuthError(error: AuthError | Error | null): string {
  if (!error) return 'Unbekannter Fehler. Bitte erneut versuchen.'

  const msg = error.message?.toLowerCase() ?? ''

  if (msg.includes('redirect') || msg.includes('redirect_uri')) {
    return `Redirect-URL nicht erlaubt (${getGoogleOAuthRedirectUrl()}). In Supabase unter Authentication → URL Configuration hinzufügen.`
  }
  if (msg.includes('rate limit') || msg.includes('email rate')) {
    return 'Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.'
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate')) {
    return 'Bitte eine gültige E-Mail-Adresse eingeben.'
  }
  if (msg.includes('signup') && msg.includes('disabled')) {
    return 'Registrierung ist derzeit deaktiviert.'
  }
  if (msg.includes('otp') && msg.includes('expired')) {
    return 'Der Login-Link ist abgelaufen. Bitte einen neuen anfordern.'
  }

  return error.message || 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.'
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

export async function signInWithGoogle(): Promise<AuthActionResult> {
  const redirectTo = getGoogleOAuthRedirectUrl()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  })

  return {
    error,
    message: error ? formatAuthError(error) : null,
  }
}

export async function signInWithEmail(email: string): Promise<AuthActionResult> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) {
    return {
      error: { message: 'E-Mail fehlt', name: 'ValidationError', status: 400 } as AuthError,
      message: 'Bitte eine E-Mail-Adresse eingeben.',
    }
  }

  const redirectTo = getAuthRedirectUrl('/')

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  })

  return {
    error,
    message: error ? formatAuthError(error) : null,
  }
}

export function scrollToLogin() {
  scrollToSection('login')
}
