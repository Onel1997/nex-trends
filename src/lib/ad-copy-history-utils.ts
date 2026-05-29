import type { AdCopyGenerationBatch } from '@/types/ad-copy-generation'

export type HistoryDateGroup = 'today' | 'yesterday' | 'older'

export const AD_COPY_HISTORY_GROUP_LABELS: Record<HistoryDateGroup, string> = {
  today: 'Heute',
  yesterday: 'Gestern',
  older: 'Älter',
}

export function getAdCopyHistoryDateGroup(iso: string): HistoryDateGroup {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'older'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000)

  if (date >= startOfToday) return 'today'
  if (date >= startOfYesterday) return 'yesterday'
  return 'older'
}

export type GroupedAdCopyHistory = {
  group: HistoryDateGroup
  label: string
  items: AdCopyGenerationBatch[]
}

export function groupAdCopyHistoryByDate(rows: AdCopyGenerationBatch[]): GroupedAdCopyHistory[] {
  const buckets: Record<HistoryDateGroup, AdCopyGenerationBatch[]> = {
    today: [],
    yesterday: [],
    older: [],
  }

  for (const row of rows) {
    buckets[getAdCopyHistoryDateGroup(row.created_at)].push(row)
  }

  return (['today', 'yesterday', 'older'] as const)
    .filter((g) => buckets[g].length > 0)
    .map((group) => ({
      group,
      label: AD_COPY_HISTORY_GROUP_LABELS[group],
      items: buckets[group],
    }))
}
