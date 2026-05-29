import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function requireEnv(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing environment variable: ${name}. Add it to your .env file.`,
    )
  }
  return value.trim()
}

/** Resolved hosted project URL — never local `supabase start` for browser auth. */
export const SUPABASE_URL = requireEnv(supabaseUrl, 'VITE_SUPABASE_URL')

/** True when the app points at local `supabase start` (Google OAuth unavailable). */
export function isLocalSupabaseUrl(url = SUPABASE_URL): boolean {
  try {
    const { hostname } = new URL(url)
    return hostname === '127.0.0.1' || hostname === 'localhost'
  } catch {
    return false
  }
}

export const supabase = createClient(
  SUPABASE_URL,
  requireEnv(supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY'),
  {
    auth: {
      // OAuth PKCE is exchanged explicitly on /auth/callback (avoids double exchange).
      detectSessionInUrl: false,
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
