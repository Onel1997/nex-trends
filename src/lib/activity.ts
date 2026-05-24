import type { ActivityItem } from '@/types/dashboard'
import { generateId } from '@/lib/utils'

const ACTIVITY_KEY = 'nextrends_recent_activity'
const MAX_ACTIVITIES = 8

export function logActivity(tool: string, label: string): void {
  try {
    const item: ActivityItem = {
      id: generateId(),
      tool,
      label,
      timestamp: new Date().toISOString(),
    }

    const existing = getRecentActivities()
    const next = [item, ...existing].slice(0, MAX_ACTIVITIES)
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next))
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
