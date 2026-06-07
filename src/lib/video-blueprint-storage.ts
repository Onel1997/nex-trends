import type { SavedVideoBlueprint, VideoBlueprint } from '@/types/video-blueprint'

const STORAGE_KEY = 'nextrends_video_blueprints'
const MAX_SAVED = 30

function readAll(): SavedVideoBlueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedVideoBlueprint[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(items: SavedVideoBlueprint[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_SAVED)))
  } catch {
    // quota
  }
}

export function saveVideoBlueprint(blueprint: VideoBlueprint): SavedVideoBlueprint {
  const saved: SavedVideoBlueprint = {
    ...blueprint,
    savedAt: new Date().toISOString(),
  }
  const existing = readAll().filter((b) => b.id !== blueprint.id)
  writeAll([saved, ...existing])
  return saved
}

export function isBlueprintSaved(id: string): boolean {
  return readAll().some((b) => b.id === id)
}

export function getSavedBlueprints(): SavedVideoBlueprint[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  )
}

export function removeSavedBlueprint(id: string): void {
  writeAll(readAll().filter((b) => b.id !== id))
}
