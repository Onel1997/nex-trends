import { isDevEnvironment } from '@/lib/runtime'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type TrendUniquenessKey = 'id' | 'video' | 'thumbnail' | 'creator' | 'hook'

export type TrendUniquenessSets = Record<TrendUniquenessKey, Set<string>>

export function createUniquenessSets(): TrendUniquenessSets {
  return {
    id: new Set(),
    video: new Set(),
    thumbnail: new Set(),
    creator: new Set(),
    hook: new Set(),
  }
}

export function trendUniquenessKeys(trend: TrendIntelligence): Record<TrendUniquenessKey, string> {
  return {
    id: trend.id,
    video: trend.videoUrl?.trim() ?? '',
    thumbnail: trend.thumbnailUrl?.trim() ?? '',
    creator: trend.creator?.handle?.trim() ?? '',
    hook: trend.hookAnalysis.hookText.trim(),
  }
}

export function hasUniquenessConflict(
  trend: TrendIntelligence,
  seen: TrendUniquenessSets,
): boolean {
  const keys = trendUniquenessKeys(trend)
  return (
    (keys.id !== '' && seen.id.has(keys.id)) ||
    (keys.video !== '' && seen.video.has(keys.video)) ||
    (keys.thumbnail !== '' && seen.thumbnail.has(keys.thumbnail)) ||
    (keys.creator !== '' && seen.creator.has(keys.creator)) ||
    (keys.hook !== '' && seen.hook.has(keys.hook))
  )
}

export function registerTrendUniqueness(
  trend: TrendIntelligence,
  seen: TrendUniquenessSets,
): void {
  const keys = trendUniquenessKeys(trend)
  if (keys.id) seen.id.add(keys.id)
  if (keys.video) seen.video.add(keys.video)
  if (keys.thumbnail) seen.thumbnail.add(keys.thumbnail)
  if (keys.creator) seen.creator.add(keys.creator)
  if (keys.hook) seen.hook.add(keys.hook)
}

/** Pick up to `limit` trends from shuffled pool with strict de-duplication */
export function pickUniqueTrends(
  shuffledPool: TrendIntelligence[],
  limit: number,
): TrendIntelligence[] {
  const seen = createUniquenessSets()
  const picked: TrendIntelligence[] = []

  for (const trend of shuffledPool) {
    if (hasUniquenessConflict(trend, seen)) continue
    picked.push(trend)
    registerTrendUniqueness(trend, seen)
    if (picked.length >= limit) break
  }

  return picked
}

export function countUniqueVideos(trends: TrendIntelligence[]): number {
  return new Set(trends.map((t) => t.videoUrl).filter(Boolean)).size
}

export function countUniqueCreators(trends: TrendIntelligence[]): number {
  return new Set(trends.map((t) => t.creator?.handle).filter(Boolean)).size
}

type DuplicateReport = {
  context: string
  field: TrendUniquenessKey
  value: string
  ids: string[]
}

function findDuplicates(
  trends: TrendIntelligence[],
  context: string,
): DuplicateReport[] {
  const reports: DuplicateReport[] = []
  const fields: TrendUniquenessKey[] = ['id', 'video', 'thumbnail', 'creator', 'hook']

  for (const field of fields) {
    const map = new Map<string, string[]>()
    for (const trend of trends) {
      const keys = trendUniquenessKeys(trend)
      const value = keys[field]
      if (!value) continue
      const list = map.get(value) ?? []
      list.push(trend.id)
      map.set(value, list)
    }
    for (const [value, ids] of map) {
      if (ids.length > 1) {
        reports.push({ context, field, value, ids })
      }
    }
  }

  return reports
}

/** Dev-only safeguards — warns in console, never throws in production UI */
export function assertUniqueTrendSet(
  trends: TrendIntelligence[],
  context: string,
): void {
  if (!isDevEnvironment()) return

  const duplicates = findDuplicates(trends, context)
  if (duplicates.length === 0) return

  const summary = duplicates
    .map((d) => `${d.field}="${d.value.slice(0, 48)}" → [${d.ids.join(', ')}]`)
    .join('\n')

  console.warn(
    `[Trend Intelligence] Duplicate ${context} detected (${duplicates.length}):\n${summary}`,
  )
}

export function assertUniqueTrendCatalog(trends: TrendIntelligence[]): void {
  assertUniqueTrendSet(trends, 'demo catalog')
}
