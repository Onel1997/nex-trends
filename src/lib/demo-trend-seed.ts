const USER_SEED_KEY = 'nextrends_ti_user_seed'

export function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Mulberry32 PRNG — deterministic from numeric seed */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function getDemoUserSeed(): string {
  try {
    const existing = localStorage.getItem(USER_SEED_KEY)
    if (existing) return existing
    const seed = `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(USER_SEED_KEY, seed)
    return seed
  } catch {
    return 'demo-user-seed-fallback'
  }
}

export function searchShuffleSeed(query: string, userSeed = getDemoUserSeed()): number {
  return hashString(`${userSeed}::${query.trim().toLowerCase()}`)
}
