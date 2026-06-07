import type { HookPlatform, HookTone } from '@/types/ai-generation'

const STORAGE_KEY = 'nextrends:hook-regenerate-prefill'

let cachedPrefill: HookRegeneratePrefill | null = null

export type HookRegeneratePrefill = {
  topic: string
  tone: HookTone
  platform: HookPlatform
  /** When true, Hook Generator auto-starts a free regenerate on load. */
  autoGenerate?: boolean
  /** Trend Intelligence context — pre-fills Hook Generator from a trend card */
  trendTitle?: string
  category?: string
  description?: string
  /** Combined context passed to hook generation (description, category, niche) */
  context?: string
  referenceHook?: string
}

export function setHookRegeneratePrefill(data: HookRegeneratePrefill): void {
  cachedPrefill = data
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* private mode / quota */
  }
}

export function consumeHookRegeneratePrefill(): HookRegeneratePrefill | null {
  if (cachedPrefill) return cachedPrefill

  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HookRegeneratePrefill
    if (!parsed?.topic?.trim()) return null
    cachedPrefill = parsed
    return parsed
  } catch {
    return null
  }
}

/** Clears prefill after Hook Generator applied it (deferred for Strict Mode remounts). */
export function clearHookRegeneratePrefill(): void {
  cachedPrefill = null
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* private mode / quota */
  }
}
