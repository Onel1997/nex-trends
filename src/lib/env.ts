/** Safe process.env read — works in Node, Edge middleware, and browser bundles. */
function readProcessEnv(key: string): string | undefined {
  try {
    const env =
      typeof process !== 'undefined' ? process.env : undefined
    const value = env?.[key]
    return typeof value === 'string' ? value.trim() : undefined
  } catch {
    return undefined
  }
}

/** Safe import.meta.env read — Vite dev only; unavailable in Next.js middleware/edge. */
function readViteEnv(key: string): string | undefined {
  try {
    if (typeof import.meta === 'undefined') return undefined
    const viteEnv = import.meta.env as Record<string, string | undefined> | undefined
    if (!viteEnv) return undefined
    const value = viteEnv[key]
    return typeof value === 'string' ? value.trim() : undefined
  } catch {
    return undefined
  }
}

/** Read env vars in Next.js (process.env), Edge middleware, and Vite (import.meta.env). */
export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const fromProcess = readProcessEnv(key)
    if (fromProcess) return fromProcess
  }

  for (const key of keys) {
    const fromVite = readViteEnv(key)
    if (fromVite) return fromVite
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
