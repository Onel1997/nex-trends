import type { ActivityItem, ActivityKind } from '@/types/dashboard'
import { persistActivityToSupabase } from '@/lib/dashboard-activity-api'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/utils'

const ACTIVITY_KEY = 'nextrends_recent_activity'
const MAX_ACTIVITIES = 8

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

export function logActivity(tool: string, label: string, kind?: ActivityKind): void {
  try {
    const item: ActivityItem = {
      id: generateId(),
      tool,
      label,
      timestamp: new Date().toISOString(),
      kind: kind ?? inferActivityKind(tool, label),
    }

    const existing = getRecentActivities()
    const next = [item, ...existing].slice(0, MAX_ACTIVITIES)
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next))

    void supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id
      if (!userId) return
      void persistActivityToSupabase(userId, item)
    })
  } catch {
    // ignore storage errors
  }
}

export function getRecentActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ActivityItem[]
  } catch {
    return []
  }
}
