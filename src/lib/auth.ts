import { useEffect, useState } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'
import { readEnv } from '@/lib/env'
import { getBrowserPathname, isBrowser } from '@/lib/runtime'
import { isLocalSupabaseUrl, supabase } from '@/lib/supabase'
import { scrollToSection } from '@/lib/scroll'

export type AuthActionResult = {
  error: AuthError | null
  message: string | null
}

/** Dedicated OAuth callback path — must match Supabase redirect allow-list entries. */
export const AUTH_CALLBACK_PATH = '/auth/callback'

/** Login page shown after failed OAuth. */
export const AUTH_LOGIN_PATH = '/login'

export const AUTH_ERROR_STORAGE_KEY = 'nextrends_auth_error'

/** Read VITE_SITE_URL or NEXT_PUBLIC_SITE_URL (production: https://nextrends-ai.de). */
export function getConfiguredSiteUrl(): string | null {
  const raw =
  typeof window !== 'undefined'
    ? window.location.origin
    : readEnv('NEXT_PUBLIC_SITE_URL', 'VITE_SITE_URL')
  if (!raw) return null

  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    return url.origin
  } catch {
    return null
  }
}

/** Origin the user actually loaded (LAN IP on mobile, localhost on desktop). */
export function getAppOrigin(): string {
  if (!isBrowser()) {
    return getConfiguredSiteUrl() ?? ''
  }

  return window.location.origin
}

export function isAuthCallbackPath(pathname?: string): boolean {
  const normalized = (pathname ?? getBrowserPathname()).replace(/\/$/, '') || '/'
  return normalized === AUTH_CALLBACK_PATH
}

export function isLoginPath(pathname?: string): boolean {
  const normalized = (pathname ?? getBrowserPathname()).replace(/\/$/, '') || '/'
  return normalized === AUTH_LOGIN_PATH
}

/**
 * Google OAuth redirect URL — always `${origin}/auth/callback`.
 * Must match Supabase Auth → Redirect URLs allow-list.
 */
export function getGoogleOAuthRedirectUrl(): string {
  return getAuthRedirectUrl(AUTH_CALLBACK_PATH)
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

function isPkceVerifierMissingError(error: AuthError | null): boolean {
  const msg = error?.message?.toLowerCase() ?? ''
  return msg.includes('pkce') && msg.includes('verifier')
}

async function getActiveSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
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

/** Dedupes concurrent callback handling (e.g. React Strict Mode). */
let authCallbackInFlight: Promise<AuthActionResult> | null = null

async function runAuthCallbackExchange(): Promise<AuthActionResult> {
  const existingSession = await getActiveSession()
  if (existingSession) {
    cleanAuthParamsFromUrl()
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
    if (isPkceVerifierMissingError(error)) {
      const sessionAfterRace = await getActiveSession()
      if (sessionAfterRace) {
        return { error: null, message: null }
      }
    }
    return { error, message: formatAuthError(error) }
  }

  return { error: null, message: null }
}

/**
 * Exchange PKCE OAuth code on /auth/callback.
 * Idempotent: skips exchange when a session already exists.
 */
export function completeAuthCallback(): Promise<AuthActionResult> {
  if (typeof window === 'undefined') {
    return Promise.resolve({ error: null, message: null })
  }

  if (!authCallbackInFlight) {
    authCallbackInFlight = runAuthCallbackExchange().finally(() => {
      authCallbackInFlight = null
    })
  }

  return authCallbackInFlight
}

/** Dashboard path after successful OAuth — used by the callback page. */
export function getPostAuthRedirectPath(): string {
  return '/dashboard'
}

/** Redirect to login after failed OAuth (stores message for optional UI). */
export function redirectToLoginAfterAuthFailure(message?: string | null): void {
  if (typeof window === 'undefined') return

  if (message) {
    try {
      sessionStorage.setItem(AUTH_ERROR_STORAGE_KEY, message)
    } catch {
      /* sessionStorage unavailable */
    }
  }

  cleanAuthParamsFromUrl()
  window.location.replace(AUTH_LOGIN_PATH)
}

/** @deprecated Use redirectToLoginAfterAuthFailure */
export function redirectToHomeAfterAuthFailure(message?: string | null): void {
  redirectToLoginAfterAuthFailure(message)
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
  if (msg.includes('provider is not enabled') || msg.includes('unsupported provider')) {
    return 'Google-Anmeldung ist nicht aktiv. VITE_SUPABASE_URL muss auf das gehostete Supabase-Projekt zeigen (nicht 127.0.0.1:54321).'
  }

  return error.message || 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.'
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null)
    })

    const result = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    const subscription = result?.data?.subscription
    return () => subscription?.unsubscribe()
  }, [])

  return session
}

export async function signInWithGoogle(): Promise<AuthActionResult> {
  if (isLocalSupabaseUrl()) {
    const message =
      'Google-Anmeldung erfordert das gehostete Supabase-Projekt. Setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env (siehe .env.example).'
    return {
      error: { message, name: 'AuthConfigError', status: 400 } as AuthError,
      message,
    }
  }

  const redirectTo = getGoogleOAuthRedirectUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // Manual redirect keeps the user gesture chain intact (Safari/iOS) and avoids
      // a stuck loading state when the client auto-redirect silently fails.
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    return {
      error,
      message: formatAuthError(error),
    }
  }

  if (data?.url) {
    window.location.assign(data.url)
    return { error: null, message: null }
  }

  const fallbackMessage =
    'Google-Anmeldung konnte nicht gestartet werden. Bitte erneut versuchen.'
  return {
    error: {
      message: fallbackMessage,
      name: 'AuthRedirectError',
      status: 500,
    } as AuthError,
    message: fallbackMessage,
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
