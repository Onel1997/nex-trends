/** Lightweight client-side hook analytics — localStorage prep for future server sync. */

const STORAGE_KEY = 'nextrends:hook-analytics'
const MAX_RECENT_COPIES = 5
const MAX_SAVE_EVENTS = 100

export type HookAnalyticsEventType = 'copy' | 'save' | 'unsave' | 'generate' | 'regenerate'

export type HookAnalyticsEvent = {
  type: HookAnalyticsEventType
  at: string
  tone?: string
  platform?: string
  hookPreview?: string
  topic?: string
}

export type HookRecentCopy = {
  text: string
  at: string
}

export type HookAnalyticsStore = {
  version: 1
  recentCopies: HookRecentCopy[]
  events: HookAnalyticsEvent[]
}

function emptyStore(): HookAnalyticsStore {
  return { version: 1, recentCopies: [], events: [] }
}

function readStore(): HookAnalyticsStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as HookAnalyticsStore
    if (parsed.version !== 1) return emptyStore()
    return {
      version: 1,
      recentCopies: Array.isArray(parsed.recentCopies) ? parsed.recentCopies : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: HookAnalyticsStore): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* quota / private mode */
  }
}

function appendEvent(event: Omit<HookAnalyticsEvent, 'at'>): HookAnalyticsStore {
  const store = readStore()
  store.events = [{ ...event, at: new Date().toISOString() }, ...store.events].slice(
    0,
    MAX_SAVE_EVENTS,
  )
  writeStore(store)
  return store
}

export function recordHookCopy(hookText: string): HookAnalyticsStore {
  const store = readStore()
  const preview = hookText.slice(0, 80)
  store.recentCopies = [
    { text: preview, at: new Date().toISOString() },
    ...store.recentCopies.filter((c) => c.text !== preview),
  ].slice(0, MAX_RECENT_COPIES)
  store.events = [
    { type: 'copy' as const, at: new Date().toISOString(), hookPreview: preview },
    ...store.events,
  ].slice(0, MAX_SAVE_EVENTS)
  writeStore(store)
  return store
}

export function recordHookSave(tone?: string, platform?: string): void {
  appendEvent({ type: 'save', tone, platform })
}

export function recordHookUnsave(tone?: string): void {
  appendEvent({ type: 'unsave', tone })
}

export function recordHookGeneration(topic?: string, isRegenerate = false): void {
  appendEvent({
    type: isRegenerate ? 'regenerate' : 'generate',
    topic: topic?.slice(0, 60),
  })
}

export function getRecentCopies(): HookRecentCopy[] {
  return readStore().recentCopies
}

export function getHookAnalyticsEvents(): HookAnalyticsEvent[] {
  return readStore().events
}

/** Export shape for future server-side analytics ingestion. */
export function exportHookAnalyticsSnapshot() {
  return readStore()
}
