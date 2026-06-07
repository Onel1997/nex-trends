import type { SupabaseClient } from '@supabase/supabase-js'

/** Minimal Supabase client used when env vars are missing — never throws on auth calls. */
export function createUnconfiguredSupabaseClient(): SupabaseClient {
  const noopSubscription = { unsubscribe: () => {} }

  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: noopSubscription } }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({
      data: { provider: 'google', url: null },
      error: {
        message: 'Supabase ist nicht konfiguriert.',
        name: 'AuthConfigError',
        status: 503,
      },
    }),
    signInWithOtp: async () => ({
      data: { user: null, session: null },
      error: {
        message: 'Supabase ist nicht konfiguriert.',
        name: 'AuthConfigError',
        status: 503,
      },
    }),
    exchangeCodeForSession: async () => ({
      data: { session: null, user: null },
      error: {
        message: 'Supabase ist nicht konfiguriert.',
        name: 'AuthConfigError',
        status: 503,
      },
    }),
  }

  return { auth } as unknown as SupabaseClient
}
