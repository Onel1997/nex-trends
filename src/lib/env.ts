/** Read env vars in both Next.js (process.env) and Vite (import.meta.env). */
export function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const fromProcess =
      typeof process !== 'undefined' ? process.env[key]?.trim() : undefined
    if (fromProcess) return fromProcess
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteEnv = import.meta.env as Record<string, string | undefined>
    for (const key of keys) {
      const value = viteEnv[key]?.trim()
      if (value) return value
    }
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
