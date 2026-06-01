import { supabase } from '@/lib/supabase'
import type { ActivityItem, ActivityKind } from '@/types/dashboard'

const ACTIVITY_TABLE = 'user_recent_activity'
const MAX_ACTIVITIES = 12

type ActivityRow = {
  id: string
  tool: string
  label: string
  kind: string
  created_at: string
}

function rowToItem(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    tool: row.tool,
    label: row.label,
    timestamp: row.created_at,
    kind: (row.kind as ActivityKind) || 'generic',
  }
}

export async function fetchRecentActivityFromSupabase(
  userId: string,
): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from(ACTIVITY_TABLE)
    .select('id, tool, label, kind, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_ACTIVITIES)

  if (error) {
    console.error('[activity] fetch failed:', error.message)
    return []
  }

  return (data as ActivityRow[] | null)?.map(rowToItem) ?? []
}

export async function persistActivityToSupabase(
  userId: string,
  item: Omit<ActivityItem, 'id'> & { kind?: ActivityKind },
): Promise<ActivityItem | null> {
  const kind = item.kind ?? 'generic'

  const { data, error } = await supabase
    .from(ACTIVITY_TABLE)
    .insert({
      user_id: userId,
      tool: item.tool,
      label: item.label,
      kind,
    })
    .select('id, tool, label, kind, created_at')
    .single()

  if (error) {
    console.error('[activity] insert failed:', error.message)
    return null
  }

  return rowToItem(data as ActivityRow)
}

export async function syncLocalActivitiesToSupabase(
  userId: string,
  items: ActivityItem[],
): Promise<void> {
  if (items.length === 0) return

  const rows = items.slice(0, MAX_ACTIVITIES).map((item) => ({
    user_id: userId,
    tool: item.tool,
    label: item.label,
    kind: item.kind ?? 'generic',
    created_at: item.timestamp,
  }))

  const { error } = await supabase.from(ACTIVITY_TABLE).insert(rows)

  if (error && !error.message.includes('duplicate')) {
    console.error('[activity] bulk sync failed:', error.message)
  }
}
