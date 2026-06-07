/** Lightweight client-side ad copy analytics — localStorage prep for future server sync. */

const STORAGE_KEY = 'nextrends:ad-copy-analytics'
const MAX_RECENT_COPIES = 5
const MAX_SAVE_EVENTS = 100

export type AdCopyAnalyticsEventType = 'copy' | 'save' | 'unsave' | 'generate' | 'regenerate'

export type AdCopyAnalyticsEvent = {
  type: AdCopyAnalyticsEventType
  at: string
  tone?: string
  platform?: string
  preview?: string
  briefing?: string
}

export type AdCopyRecentCopy = {
  text: string
  at: string
}

export type AdCopyAnalyticsStore = {
  version: 1
  recentCopies: AdCopyRecentCopy[]
  events: AdCopyAnalyticsEvent[]
}

function emptyStore(): AdCopyAnalyticsStore {
  return { version: 1, recentCopies: [], events: [] }
}

function readStore(): AdCopyAnalyticsStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as AdCopyAnalyticsStore
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

function writeStore(store: AdCopyAnalyticsStore): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* quota / private mode */
  }
}

function appendEvent(event: Omit<AdCopyAnalyticsEvent, 'at'>): AdCopyAnalyticsStore {
  const store = readStore()
  store.events = [{ ...event, at: new Date().toISOString() }, ...store.events].slice(
    0,
    MAX_SAVE_EVENTS,
  )
  writeStore(store)
  return store
}

export function recordAdCopyCopy(preview: string): AdCopyAnalyticsStore {
  const store = readStore()
  const text = preview.slice(0, 80)
  store.recentCopies = [
    { text, at: new Date().toISOString() },
    ...store.recentCopies.filter((c) => c.text !== text),
  ].slice(0, MAX_RECENT_COPIES)
  store.events = [
    { type: 'copy' as const, at: new Date().toISOString(), preview: text },
    ...store.events,
  ].slice(0, MAX_SAVE_EVENTS)
  writeStore(store)
  return store
}

export function recordAdCopySave(tone?: string, platform?: string): void {
  appendEvent({ type: 'save', tone, platform })
}

export function recordAdCopyUnsave(tone?: string): void {
  appendEvent({ type: 'unsave', tone })
}

export function recordAdCopyGeneration(briefing?: string, isRegenerate = false): void {
  appendEvent({
    type: isRegenerate ? 'regenerate' : 'generate',
    briefing: briefing?.slice(0, 60),
  })
}

export function getAdCopyRecentCopies(): AdCopyRecentCopy[] {
  return readStore().recentCopies
}

export function getAdCopyAnalyticsEvents(): AdCopyAnalyticsEvent[] {
  return readStore().events
}
