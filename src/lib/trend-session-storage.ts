import type { ScoutPlatform } from '@/components/trends/TrendScoutSearch'
import type { TrendsView } from '@/components/trends/TrendsTabNav'
import { sanitizeTrendMedia } from '@/lib/trend-media-assignment'
import type { TrendIntelligence } from '@/types/trend-intelligence'

const STORAGE_KEY = 'nextrends_ti_session'
/** Bump when session shape / eligibility rules change */
const SESSION_VERSION = 4
const MAX_TRENDS = 40
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export type PersistedTrendSession = {
  version: typeof SESSION_VERSION
  searchQuery: string
  platform: ScoutPlatform
  trends: TrendIntelligence[]
  isDemo: boolean
  /** True only after the user explicitly submitted a Trend Intelligence search */
  hasUserSearch: boolean
  view: TrendsView
  scrollTop: number
  updatedAt: number
}

function isScoutPlatform(value: unknown): value is ScoutPlatform {
  return value === 'all' || value === 'tiktok' || value === 'instagram' || value === 'youtube'
}

function isTrendsView(value: unknown): value is TrendsView {
  return value === 'explore' || value === 'saved' || value === 'history'
}

function isTrendIntelligence(value: unknown): value is TrendIntelligence {
  if (!value || typeof value !== 'object') return false
  const t = value as TrendIntelligence
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.platform === 'string' &&
    typeof t.thumbnailUrl === 'string' &&
    typeof t.creator === 'object' &&
    t.creator !== null
  )
}

export function loadTrendSession(): PersistedTrendSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<PersistedTrendSession>
    if (parsed.version !== SESSION_VERSION) return null
    if (typeof parsed.updatedAt !== 'number') return null
    if (Date.now() - parsed.updatedAt > MAX_AGE_MS) return null
    if (!isScoutPlatform(parsed.platform)) return null
    if (!isTrendsView(parsed.view)) return null
    if (!Array.isArray(parsed.trends)) return null

    const trends = parsed.trends
      .filter(isTrendIntelligence)
      .slice(0, MAX_TRENDS)
      .map((trend, index) => sanitizeTrendMedia(trend, index))
    const searchQuery = typeof parsed.searchQuery === 'string' ? parsed.searchQuery : ''
    const hasUserSearch = parsed.hasUserSearch === true
    const hasContent = trends.length > 0 || searchQuery.trim() !== ''
    if (!hasContent || !hasUserSearch) return null

    return {
      version: SESSION_VERSION,
      searchQuery,
      platform: parsed.platform,
      trends,
      isDemo: false,
      hasUserSearch: true,
      view: parsed.view,
      scrollTop:
        typeof parsed.scrollTop === 'number' && parsed.scrollTop >= 0
          ? parsed.scrollTop
          : 0,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

export function saveTrendSession(session: Omit<PersistedTrendSession, 'version' | 'updatedAt'>): void {
  if (!session.hasUserSearch || session.isDemo) return

  try {
    const payload: PersistedTrendSession = {
      version: SESSION_VERSION,
      searchQuery: session.searchQuery,
      platform: session.platform,
      trends: session.trends.slice(0, MAX_TRENDS),
      isDemo: false,
      hasUserSearch: session.hasUserSearch,
      view: session.view,
      scrollTop: Math.max(0, session.scrollTop),
      updatedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // quota / private mode
  }
}

/** Trend cards eligible for Hook Generator — only from explicit user searches */
export function loadHookTrendContext(): TrendIntelligence[] {
  const session = loadTrendSession()
  if (!session?.hasUserSearch || session.isDemo) return []
  return session.trends
}

export function trendTopicFromIntelligence(trend: TrendIntelligence): string {
  return trend.niche?.trim() || trend.title
}

export function clearTrendSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getDashboardScrollElement(): HTMLElement | null {
  return document.querySelector('main')
}
