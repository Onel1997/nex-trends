import type { GeneratedHooksRow } from '@/types/ai-generation'

export type HistoryDateGroup = 'today' | 'yesterday' | 'older'

export const HISTORY_GROUP_LABELS: Record<HistoryDateGroup, string> = {
  today: 'Heute',
  yesterday: 'Gestern',
  older: 'Älter',
}

export function getHistoryDateGroup(iso: string): HistoryDateGroup {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'older'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000)

  if (date >= startOfToday) return 'today'
  if (date >= startOfYesterday) return 'yesterday'
  return 'older'
}

export type GroupedHistory = {
  group: HistoryDateGroup
  label: string
  items: GeneratedHooksRow[]
}

export function groupHistoryByDate(rows: GeneratedHooksRow[]): GroupedHistory[] {
  const buckets: Record<HistoryDateGroup, GeneratedHooksRow[]> = {
    today: [],
    yesterday: [],
    older: [],
  }

  for (const row of rows) {
    buckets[getHistoryDateGroup(row.created_at)].push(row)
  }

  return (['today', 'yesterday', 'older'] as const)
    .filter((g) => buckets[g].length > 0)
    .map((group) => ({
      group,
      label: HISTORY_GROUP_LABELS[group],
      items: buckets[group],
    }))
}
