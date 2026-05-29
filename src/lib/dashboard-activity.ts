import { getRecentActivities } from '@/lib/activity'
import { getAdCopyAnalyticsEvents } from '@/lib/ad-copy-analytics'
import { getHookAnalyticsEvents } from '@/lib/hook-analytics'
import { getToneLabel, getPlatformLabel } from '@/lib/hook-display'
import { getSeoTitleAnalyticsEvents } from '@/lib/seo-title-analytics'
import { generateId } from '@/lib/utils'
import type { ActivityItem, ActivityKind } from '@/types/dashboard'

const MAX_FEED_ITEMS = 12

function hookEventToActivity(
  event: ReturnType<typeof getHookAnalyticsEvents>[number],
): ActivityItem | null {
  const at = event.at
  switch (event.type) {
    case 'generate':
      return {
        id: `hook-gen-${at}`,
        tool: 'Hook Generator',
        label: event.topic ? `Hooks generiert: ${event.topic}` : 'Hooks generiert',
        timestamp: at,
        kind: 'hook',
      }
    case 'regenerate':
      return {
        id: `hook-regen-${at}`,
        tool: 'Hook Generator',
        label: event.topic ? `Hooks neu generiert: ${event.topic}` : 'Hooks neu generiert',
        timestamp: at,
        kind: 'hook',
      }
    case 'save':
      return {
        id: `hook-save-${at}`,
        tool: 'Saved Hooks',
        label: 'Hook gespeichert',
        timestamp: at,
        kind: 'saved',
      }
    case 'unsave':
      return {
        id: `hook-unsave-${at}`,
        tool: 'Saved Hooks',
        label: 'Hook aus Bibliothek entfernt',
        timestamp: at,
        kind: 'saved',
      }
    case 'copy':
      return {
        id: `hook-copy-${at}`,
        tool: 'Hook Generator',
        label: event.hookPreview
          ? `Hook kopiert: ${event.hookPreview}${event.hookPreview.length >= 72 ? '…' : ''}`
          : 'Hook kopiert',
        timestamp: at,
        kind: 'hook',
      }
    default:
      return null
  }
}

function adCopyEventToActivity(
  event: ReturnType<typeof getAdCopyAnalyticsEvents>[number],
): ActivityItem | null {
  const at = event.at
  switch (event.type) {
    case 'generate':
      return {
        id: `ad-gen-${at}`,
        tool: 'AI Ad Copy',
        label: event.briefing ? `Ad Copy generiert: ${event.briefing}` : 'Ad Copy generiert',
        timestamp: at,
        kind: 'ad_copy',
      }
    case 'regenerate':
      return {
        id: `ad-regen-${at}`,
        tool: 'AI Ad Copy',
        label: 'Ad Copy neu generiert',
        timestamp: at,
        kind: 'ad_copy',
      }
    case 'save':
      return {
        id: `ad-save-${at}`,
        tool: 'AI Ad Copy',
        label: 'Ad gespeichert',
        timestamp: at,
        kind: 'saved',
      }
    case 'unsave':
      return {
        id: `ad-unsave-${at}`,
        tool: 'AI Ad Copy',
        label: 'Ad aus Favoriten entfernt',
        timestamp: at,
        kind: 'ad_copy',
      }
    case 'copy':
      return {
        id: `ad-copy-${at}`,
        tool: 'AI Ad Copy',
        label: event.preview
          ? `Ad kopiert: ${event.preview}${event.preview.length >= 72 ? '…' : ''}`
          : 'Ad Copy kopiert',
        timestamp: at,
        kind: 'ad_copy',
      }
    default:
      return null
  }
}

function seoEventToActivity(
  event: ReturnType<typeof getSeoTitleAnalyticsEvents>[number],
): ActivityItem | null {
  const at = event.at
  switch (event.type) {
    case 'generate':
      return {
        id: `seo-gen-${at}`,
        tool: 'SEO Title Generator',
        label: event.briefing ? `SEO-Titel generiert: ${event.briefing}` : 'SEO-Titel generiert',
        timestamp: at,
        kind: 'seo',
      }
    case 'regenerate':
      return {
        id: `seo-regen-${at}`,
        tool: 'SEO Title Generator',
        label: 'SEO-Titel neu generiert',
        timestamp: at,
        kind: 'seo',
      }
    case 'save':
      return {
        id: `seo-save-${at}`,
        tool: 'SEO Title Generator',
        label: 'SEO-Titel gespeichert',
        timestamp: at,
        kind: 'seo',
      }
    case 'unsave':
      return {
        id: `seo-unsave-${at}`,
        tool: 'SEO Title Generator',
        label: 'Titel aus Favoriten entfernt',
        timestamp: at,
        kind: 'seo',
      }
    case 'copy':
      return {
        id: `seo-copy-${at}`,
        tool: 'SEO Title Generator',
        label: 'SEO-Titel kopiert',
        timestamp: at,
        kind: 'seo',
      }
    default:
      return null
  }
}

function inferActivityKind(tool: string, label: string): ActivityKind {
  const text = `${tool} ${label}`.toLowerCase()
  if (text.includes('video') || text.includes('studio') || text.includes('reel')) return 'video'
  if (text.includes('landing') || text.includes('analy') || text.includes('audit')) return 'audit'
  if (text.includes('seo') || text.includes('title')) return 'seo'
  if (text.includes('ad copy') || text.includes('ad-copy') || text.includes('ad ')) return 'ad_copy'
  if (text.includes('hook')) return 'hook'
  if (text.includes('saved') || text.includes('bookmark') || text.includes('favorit')) return 'saved'
  if (text.includes('trend')) return 'trend'
  return 'generic'
}

function normalizeBaseActivity(item: ActivityItem): ActivityItem {
  return {
    ...item,
    kind: item.kind ?? inferActivityKind(item.tool, item.label),
  }
}

/** Merges generic activity log with tool analytics for the dashboard feed. */
export function getMergedDashboardActivity(): ActivityItem[] {
  const base = getRecentActivities().map(normalizeBaseActivity)
  const hookItems = getHookAnalyticsEvents()
    .map(hookEventToActivity)
    .filter((item): item is ActivityItem => item !== null)
  const adItems = getAdCopyAnalyticsEvents()
    .map(adCopyEventToActivity)
    .filter((item): item is ActivityItem => item !== null)
  const seoItems = getSeoTitleAnalyticsEvents()
    .map(seoEventToActivity)
    .filter((item): item is ActivityItem => item !== null)

  const merged = [...base, ...hookItems, ...adItems, ...seoItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const seen = new Set<string>()
  const deduped: ActivityItem[] = []

  for (const item of merged) {
    const key = `${item.kind ?? ''}|${item.tool}|${item.label}|${item.timestamp.slice(0, 16)}`
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

export function createDashboardActivityId(): string {
  return generateId()
}
