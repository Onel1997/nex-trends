import type { SeoTitleGenerationBatch } from '@/types/seo-title-generation'

export type SeoHistoryDateGroup = 'today' | 'yesterday' | 'week' | 'older'

export function groupSeoTitleHistoryByDate(history: SeoTitleGenerationBatch[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const groups: Record<SeoHistoryDateGroup, SeoTitleGenerationBatch[]> = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  }

  for (const batch of history) {
    const created = new Date(batch.created_at)
    if (created >= startOfToday) groups.today.push(batch)
    else if (created >= startOfYesterday) groups.yesterday.push(batch)
    else if (created >= startOfWeek) groups.week.push(batch)
    else groups.older.push(batch)
  }

  const labels: Record<SeoHistoryDateGroup, string> = {
    today: 'Heute',
    yesterday: 'Gestern',
    week: 'Diese Woche',
    older: 'Älter',
  }

  return (['today', 'yesterday', 'week', 'older'] as const)
    .filter((g) => groups[g].length > 0)
    .map((group) => ({ group, label: labels[group], items: groups[group] }))
}
