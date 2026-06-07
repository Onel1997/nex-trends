export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Cross-runtime unique ID.
 * Uses crypto.randomUUID when available; otherwise timestamp + random (Safari / SSR safe).
 */
export function generateId(): string {
  try {
    const c =
      typeof globalThis !== 'undefined'
        ? (globalThis as { crypto?: Crypto }).crypto
        : undefined
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID()
    }
  } catch {
    /* crypto unavailable or blocked */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
