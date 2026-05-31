import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { createUnconfiguredSupabaseClient } from '@/lib/supabase/unconfigured'
import { readEnv } from '@/lib/env'

/** Resolved hosted project URL — empty string when env is missing. */
export const SUPABASE_URL =
  readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL') ?? ''

let client: SupabaseClient | null | undefined

function getClient(): SupabaseClient {
  if (client === undefined) {
    client = createSupabaseBrowserClient()
  }

  if (!client) {
    client = createUnconfiguredSupabaseClient()
  }

  return client
}

/** Lazy Supabase browser client — never throws when env vars are missing. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const resolved = getClient()
    const value = Reflect.get(resolved, prop, receiver)
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(resolved)
      : value
  },
})

/** True when the app points at local `supabase start` (Google OAuth unavailable). */
export function isLocalSupabaseUrl(url = SUPABASE_URL): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return hostname === '127.0.0.1' || hostname === 'localhost'
  } catch {
    return false
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
  )
}
