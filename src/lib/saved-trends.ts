import type { SavedTrendRecord, TrendIntelligence } from '@/types/trend-intelligence'

const STORAGE_KEY = 'nextrends_saved_trends'
const MAX_SAVED = 50

/** Supabase table name for future sync — `saved_trends` */
export const SAVED_TRENDS_TABLE = 'saved_trends' as const

function readAll(): SavedTrendRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedTrendRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records: SavedTrendRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_SAVED)))
  } catch {
    // ignore quota errors
  }
}

export function getSavedTrends(): TrendIntelligence[] {
  return readAll()
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .map((r) => ({ ...r.trend, savedAt: r.savedAt }))
}

export function isTrendSaved(trendId: string): boolean {
  return readAll().some((r) => r.trend.id === trendId)
}

export function saveTrend(trend: TrendIntelligence): boolean {
  const records = readAll()
  if (records.some((r) => r.trend.id === trend.id)) return false

  const record: SavedTrendRecord = {
    trend: { ...trend, savedAt: new Date().toISOString() },
    savedAt: new Date().toISOString(),
  }

  writeAll([record, ...records])
  return true
}

export function removeSavedTrend(trendId: string): void {
  writeAll(readAll().filter((r) => r.trend.id !== trendId))
}

export function toggleSavedTrend(trend: TrendIntelligence): boolean {
  if (isTrendSaved(trend.id)) {
    removeSavedTrend(trend.id)
    return false
  }
  saveTrend(trend)
  return true
}

/** Future: sync with Supabase when user is authenticated */
export async function syncSavedTrendsToSupabase(
  _userId: string,
  _records: SavedTrendRecord[],
): Promise<void> {
  // Prepared for: supabase.from(SAVED_TRENDS_TABLE).upsert(...)
}
