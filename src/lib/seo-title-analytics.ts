const STORAGE_KEY = 'nextrends:seo-title-analytics'
const MAX_RECENT_COPIES = 5
const MAX_EVENTS = 100

export type SeoTitleRecentCopy = { text: string; at: string }

type Store = { version: 1; recentCopies: SeoTitleRecentCopy[]; events: unknown[] }

function emptyStore(): Store {
  return { version: 1, recentCopies: [], events: [] }
}

function readStore(): Store {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as Store
    return {
      version: 1,
      recentCopies: Array.isArray(parsed.recentCopies) ? parsed.recentCopies : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(store: Store): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function recordSeoTitleCopy(preview: string): Store {
  const store = readStore()
  const text = preview.slice(0, 80)
  store.recentCopies = [
    { text, at: new Date().toISOString() },
    ...store.recentCopies.filter((c) => c.text !== text),
  ].slice(0, MAX_RECENT_COPIES)
  store.events = [
    { type: 'copy', at: new Date().toISOString(), briefing: text },
    ...store.events,
  ].slice(0, MAX_EVENTS)
  writeStore(store)
  return store
}

export function recordSeoTitleSave(): void {
  const store = readStore()
  store.events = [{ type: 'save', at: new Date().toISOString() }, ...store.events].slice(
    0,
    MAX_EVENTS,
  )
  writeStore(store)
}

export function recordSeoTitleUnsave(): void {
  const store = readStore()
  store.events = [{ type: 'unsave', at: new Date().toISOString() }, ...store.events].slice(
    0,
    MAX_EVENTS,
  )
  writeStore(store)
}

export function recordSeoTitleGeneration(briefing?: string, isRegenerate = false): void {
  const store = readStore()
  store.events = [
    {
      type: isRegenerate ? 'regenerate' : 'generate',
      at: new Date().toISOString(),
      briefing: briefing?.slice(0, 60),
    },
    ...store.events,
  ].slice(0, MAX_EVENTS)
  writeStore(store)
}

export type SeoTitleAnalyticsEvent = {
  type: 'copy' | 'save' | 'unsave' | 'generate' | 'regenerate'
  at: string
  briefing?: string
}

export function getSeoTitleRecentCopies(): SeoTitleRecentCopy[] {
  return readStore().recentCopies
}

export function getSeoTitleAnalyticsEvents(): SeoTitleAnalyticsEvent[] {
  const store = readStore()
  return (store.events as SeoTitleAnalyticsEvent[]).filter(
    (e): e is SeoTitleAnalyticsEvent =>
      typeof e === 'object' &&
      e !== null &&
      'type' in e &&
      'at' in e,
  )
}
