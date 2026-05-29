import { getRecentActivities } from '@/lib/activity'
import { getHookAnalyticsEvents } from '@/lib/hook-analytics'
import { getToneLabel, getPlatformLabel } from '@/lib/hook-display'
import { generateId } from '@/lib/utils'
import type { ActivityItem } from '@/types/dashboard'

const MAX_FEED_ITEMS = 10

function hookEventToActivity(
  event: ReturnType<typeof getHookAnalyticsEvents>[number],
): ActivityItem | null {
  const at = event.at
  switch (event.type) {
    case 'generate':
      return {
        id: `hook-gen-${at}`,
        tool: 'Hook Generator',
        label: event.topic ? `Hooks: ${event.topic}` : 'Hooks generated',
        timestamp: at,
      }
    case 'regenerate':
      return {
        id: `hook-regen-${at}`,
        tool: 'Hook Generator',
        label: event.topic ? `Regenerated: ${event.topic}` : 'Hooks regenerated',
        timestamp: at,
      }
    case 'save':
      return {
        id: `hook-save-${at}`,
        tool: 'Saved Hooks',
        label: 'Hook saved to library',
        timestamp: at,
      }
    case 'unsave':
      return {
        id: `hook-unsave-${at}`,
        tool: 'Saved Hooks',
        label: 'Hook removed from library',
        timestamp: at,
      }
    case 'copy':
      return {
        id: `hook-copy-${at}`,
        tool: 'Hook Generator',
        label: event.hookPreview
          ? `Copied: ${event.hookPreview}${event.hookPreview.length >= 80 ? '…' : ''}`
          : 'Hook copied',
        timestamp: at,
      }
    default:
      return null
  }
}

/** Merges generic activity log with hook analytics for the dashboard feed. */
export function getMergedDashboardActivity(): ActivityItem[] {
  const base = getRecentActivities()
  const hookItems = getHookAnalyticsEvents()
    .map(hookEventToActivity)
    .filter((item): item is ActivityItem => item !== null)

  const merged = [...base, ...hookItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const seen = new Set<string>()
  const deduped: ActivityItem[] = []

  for (const item of merged) {
    const key = `${item.tool}|${item.label}|${item.timestamp.slice(0, 16)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(item)
    if (deduped.length >= MAX_FEED_ITEMS) break
  }

  return deduped
}

export function computeTopHookField(
  savedHooks: { tone?: string | null; platform?: string | null }[],
  events: ReturnType<typeof getHookAnalyticsEvents>,
  field: 'tone' | 'platform',
): { value: string; label: string; count: number } | null {
  const counts = new Map<string, number>()

  const bump = (raw: string | null | undefined) => {
    if (!raw?.trim()) return
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }

  for (const hook of savedHooks) {
    bump(field === 'tone' ? hook.tone : hook.platform)
  }

  for (const event of events) {
    if (field === 'tone') bump(event.tone)
    else bump(event.platform)
  }

  let best: string | null = null
  let bestCount = 0
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }

  if (!best) return null
  const label = field === 'tone' ? getToneLabel(best) : getPlatformLabel(best)
  return { value: best, label: label || best, count: bestCount }
}

/** Stable id for client-only activity rows when needed. */
export function createDashboardActivityId(): string {
  return generateId()
}
