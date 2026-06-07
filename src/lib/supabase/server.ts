import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { readEnv } from '@/lib/env'

export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    console.error(
      '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet?.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // setAll can run from a Server Component where cookies are read-only.
        }
      },
    },
  })
}
