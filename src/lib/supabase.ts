import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
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
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.',
    )
  }

  return client
}

/** Lazy Supabase browser client — avoids crashing at module import when env is missing. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient(), prop, receiver)
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(getClient())
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
  return Boolean(SUPABASE_URL && readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'))
}
