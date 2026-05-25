import type { TrendSearchHistoryEntry } from '@/types/trend-intelligence'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'nextrends_search_history'
const MAX_ENTRIES = 20

function readAll(): TrendSearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TrendSearchHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: TrendSearchHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // ignore
  }
}

export function getSearchHistory(): TrendSearchHistoryEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export function addSearchHistory(
  query: string,
  platform: string,
  resultCount: number,
): TrendSearchHistoryEntry {
  const entry: TrendSearchHistoryEntry = {
    id: generateId(),
    query: query.trim(),
    platform,
    resultCount,
    timestamp: new Date().toISOString(),
  }

  const existing = readAll().filter(
    (e) => !(e.query.toLowerCase() === entry.query.toLowerCase() && e.platform === platform),
  )
  writeAll([entry, ...existing])
  return entry
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function removeSearchHistoryEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id))
}
