import { SAVED_TRENDS_TABLE } from '@/lib/saved-trends'
import { supabase } from '@/lib/supabase'
import type { SavedTrendRecord, TrendIntelligence } from '@/types/trend-intelligence'

const MAX_SAVED = 50

type SavedTrendRow = {
  id: string
  user_id: string
  trend_id: string
  trend_data: TrendIntelligence
  saved_at: string
}

function rowToRecord(row: SavedTrendRow): SavedTrendRecord {
  const trend = row.trend_data
  return {
    trend: { ...trend, savedAt: row.saved_at },
    savedAt: row.saved_at,
  }
}

export async function fetchSavedTrendsFromSupabase(
  userId: string,
): Promise<SavedTrendRecord[]> {
  const { data, error } = await supabase
    .from(SAVED_TRENDS_TABLE)
    .select('id, user_id, trend_id, trend_data, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
    .limit(MAX_SAVED)

  if (error) {
    console.error('[saved-trends] fetch failed:', error.message)
    return []
  }

  return (data as SavedTrendRow[] | null)?.map(rowToRecord) ?? []
}

export async function upsertSavedTrendToSupabase(
  userId: string,
  trend: TrendIntelligence,
): Promise<boolean> {
  const savedAt = new Date().toISOString()
  const trendData = { ...trend, savedAt }

  const { error } = await supabase.from(SAVED_TRENDS_TABLE).upsert(
    {
      user_id: userId,
      trend_id: trend.id,
      trend_data: trendData,
      saved_at: savedAt,
    },
    { onConflict: 'user_id,trend_id' },
  )

  if (error) {
    console.error('[saved-trends] upsert failed:', error.message)
    return false
  }
  return true
}

export async function removeSavedTrendFromSupabase(
  userId: string,
  trendId: string,
): Promise<void> {
  const { error } = await supabase
    .from(SAVED_TRENDS_TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('trend_id', trendId)

  if (error) {
    console.error('[saved-trends] delete failed:', error.message)
  }
}

export async function syncLocalSavedTrendsToSupabase(
  userId: string,
  records: SavedTrendRecord[],
): Promise<void> {
  if (records.length === 0) return

  const rows = records.slice(0, MAX_SAVED).map((record) => ({
    user_id: userId,
    trend_id: record.trend.id,
    trend_data: { ...record.trend, savedAt: record.savedAt },
    saved_at: record.savedAt,
  }))

  const { error } = await supabase.from(SAVED_TRENDS_TABLE).upsert(rows, {
    onConflict: 'user_id,trend_id',
  })

  if (error) {
    console.error('[saved-trends] bulk sync failed:', error.message)
  }
}

export function recordsToTrends(records: SavedTrendRecord[]): TrendIntelligence[] {
  return records.map((r) => ({ ...r.trend, savedAt: r.savedAt }))
}
