/**
 * Environment variable helpers for Next.js + Vite.
 *
 * Next.js only inlines `NEXT_PUBLIC_*` when accessed as static properties
 * (e.g. process.env.NEXT_PUBLIC_SUPABASE_URL). Dynamic lookups like
 * process.env[key] are undefined in client bundles — always use readEnv().
 */

/** Static process.env reads — required for Next.js client bundle inlining. */
const STATIC_PROCESS_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VITE_SITE_URL: process.env.VITE_SITE_URL,
} as const

type StaticEnvKey = keyof typeof STATIC_PROCESS_ENV

const STATIC_ENV_KEYS = new Set<string>(Object.keys(STATIC_PROCESS_ENV))

function trimValue(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/** Dynamic process.env read — works on server/Edge only; not inlined for NEXT_PUBLIC_* in client. */
function readProcessEnvDynamic(key: string): string | undefined {
  try {
    if (typeof process === 'undefined') return undefined
    return trimValue(process.env[key])
  } catch {
    return undefined
  }
}

/** Vite import.meta.env — used by `npm run dev:vite`. */
function readViteEnv(key: string): string | undefined {
  try {
    if (typeof import.meta === 'undefined') return undefined
    const viteEnv = import.meta.env as Record<string, string | undefined> | undefined
    if (!viteEnv) return undefined
    return trimValue(viteEnv[key])
  } catch {
    return undefined
  }
}

function readStaticProcessEnv(key: string): string | undefined {
  if (!STATIC_ENV_KEYS.has(key)) return undefined
  return trimValue(STATIC_PROCESS_ENV[key as StaticEnvKey])
}

/** Read env vars in Next.js (static NEXT_PUBLIC_*), server/Edge, and Vite. */
export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const fromStatic = readStaticProcessEnv(key)
    if (fromStatic) return fromStatic
  }

  for (const key of keys) {
    const fromVite = readViteEnv(key)
    if (fromVite) return fromVite
  }

  for (const key of keys) {
    const fromDynamic = readProcessEnvDynamic(key)
    if (fromDynamic) return fromDynamic
  }

  return undefined
}

export function requireEnv(...keys: string[]): string {
  const value = readEnv(...keys)
  if (!value) {
    throw new Error(`Missing environment variable: ${keys.join(' or ')}`)
  }
  return value
}

export function isSupabaseEnvConfigured(): boolean {
  return Boolean(
    readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL') &&
      readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
  )
}

export type SupabaseEnvStatus = {
  configured: boolean
  url: string | null
  anonKey: string | null
  missing: string[]
}

/** Inspect Supabase env without exposing secret values. */
export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL') ?? null
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY') ?? null
  const missing: string[] = []

  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL)')
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)')

  return {
    configured: missing.length === 0,
    url,
    anonKey,
    missing,
  }
}

let supabaseEnvLogged = false

/** One-time console diagnostics when Supabase env is missing (dev-friendly). */
export function logSupabaseEnvStatus(context = 'app'): void {
  if (supabaseEnvLogged) return

  const status = getSupabaseEnvStatus()
  if (status.configured) {
    if (process.env.NODE_ENV === 'development') {
      console.info(
        `[nex-trends:${context}] Supabase configured`,
        status.url?.replace(/^(https?:\/\/[^/]+).*/, '$1'),
      )
    }
    supabaseEnvLogged = true
    return
  }

  console.error(`[nex-trends:${context}] Supabase ist nicht konfiguriert.`, {
    missing: status.missing,
    hint:
      'Create .env or .env.local in the project root with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example), then restart: npm run dev',
    loadedFrom: typeof window === 'undefined' ? 'server' : 'browser',
  })
  supabaseEnvLogged = true
}
