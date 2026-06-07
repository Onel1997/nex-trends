import type { HookPlatform, HookTone } from '@/types/ai-generation'

const STORAGE_KEY = 'nextrends:hook-regenerate-prefill'

export type HookRegeneratePrefill = {
  topic: string
  tone: HookTone
  platform: HookPlatform
  /** When true, Hook Generator auto-starts a free regenerate on load. */
  autoGenerate?: boolean
}

export function setHookRegeneratePrefill(data: HookRegeneratePrefill): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* private mode / quota */
  }
}

export function consumeHookRegeneratePrefill(): HookRegeneratePrefill | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HookRegeneratePrefill
    if (!parsed?.topic?.trim()) return null
    return parsed
  } catch {
    return null
  }
}
