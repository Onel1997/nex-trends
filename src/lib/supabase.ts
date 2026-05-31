import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { requireEnv } from '@/lib/env'

/** Resolved hosted project URL — never local `supabase start` for browser auth. */
export const SUPABASE_URL = requireEnv(
  'NEXT_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_URL',
)

/** True when the app points at local `supabase start` (Google OAuth unavailable). */
export function isLocalSupabaseUrl(url = SUPABASE_URL): boolean {
  try {
    const { hostname } = new URL(url)
    return hostname === '127.0.0.1' || hostname === 'localhost'
  } catch {
    return false
  }
}

export const supabase = createSupabaseBrowserClient()
