import {
  batchFromRows,
  groupRowsIntoBatches,
  normalizeGeneratedSeoTitleRow,
} from '@/lib/seo-title-db'
import type {
  GeneratedSeoTitleRow,
  SeoTitleGenerationBatch,
  SeoTitleVariant,
  SeoTitleVariantWithId,
} from '@/types/seo-title-generation'

function clampScore(value: unknown, fallback = 75): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export function coerceSeoTitleVariant(item: unknown): SeoTitleVariant | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  const record = item as Record<string, unknown>

  const title = pickString(record, ['title', 'title_text', 'headline'])
  if (!title) return null

  return {
    title,
    seoScore: clampScore(record.seoScore ?? record.seo_score),
    ctrScore: clampScore(record.ctrScore ?? record.ctr_score),
    readabilityScore: clampScore(record.readabilityScore ?? record.readability_score),
    keyword: pickString(record, ['keyword']) || title.split(' ').slice(0, 3).join(' '),
    searchIntent: pickString(record, ['searchIntent', 'search_intent']) || 'informational',
  }
}

function coerceVariantWithId(item: unknown): SeoTitleVariantWithId | null {
  const base = coerceSeoTitleVariant(item)
  if (!base) return null

  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return {
      ...base,
      id: `parsed-${Date.now()}`,
      character_count: base.title.length,
      is_saved: false,
    }
  }

  const record = item as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : `parsed-${Date.now()}`
  const character_count =
    typeof record.character_count === 'number' ? record.character_count : base.title.length

  return { ...base, id, character_count, is_saved: record.is_saved === true }
}

function unwrapRecord(value: unknown): Record<string, unknown> | null {
  if (value == null) return null
  if (typeof value === 'string') {
    try {
      return unwrapRecord(JSON.parse(value.trim()) as unknown)
    } catch {
      return null
    }
  }
  if (typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function normalizeSeoTitleVariants(value: unknown): SeoTitleVariant[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    const seen = new Set<string>()
    const out: SeoTitleVariant[] = []
    for (const item of value) {
      const v = coerceSeoTitleVariant(item)
      if (!v) continue
      const key = v.title.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(v)
    }
    return out
  }
  const record = unwrapRecord(value)
  if (!record) return []
  if (Array.isArray(record.titles)) return normalizeSeoTitleVariants(record.titles)
  if (Array.isArray(record.variants)) return normalizeSeoTitleVariants(record.variants)
  if (Array.isArray(record.rows)) return normalizeSeoTitleVariants(record.rows)
  return []
}

export function normalizeSeoTitleVariantsWithId(value: unknown): SeoTitleVariantWithId[] {
  if (Array.isArray(value)) {
    return value.map(coerceVariantWithId).filter((v): v is SeoTitleVariantWithId => v != null)
  }
  const record = unwrapRecord(value)
  if (!record) return []
  if (Array.isArray(record.variants)) return normalizeSeoTitleVariantsWithId(record.variants)
  if (Array.isArray(record.titles)) return normalizeSeoTitleVariantsWithId(record.titles)
  return []
}

export function normalizeSeoTitleGenerationBatch(value: unknown): SeoTitleGenerationBatch | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : `batch-${Date.now()}`
  const variants = normalizeSeoTitleVariantsWithId(record.variants ?? record.titles)
  if (variants.length === 0) return null

  return {
    id,
    briefing: pickString(record, ['briefing']) || '',
    keyword: pickString(record, ['keyword']),
    platform: pickString(record, ['platform']) || 'Google Search',
    search_intent: pickString(record, ['search_intent', 'searchIntent']) || 'informational',
    created_at:
      typeof record.created_at === 'string' ? record.created_at : new Date().toISOString(),
    variants,
  }
}

export function normalizeSeoTitleHistoryBatches(
  value: unknown,
): SeoTitleGenerationBatch[] {
  if (Array.isArray(value)) {
    if (value.length > 0 && 'title_text' in (value[0] as object)) {
      return groupRowsIntoBatches(
        (value as GeneratedSeoTitleRow[]).map(normalizeGeneratedSeoTitleRow),
      )
    }
    return value
      .map(normalizeSeoTitleGenerationBatch)
      .filter((b): b is SeoTitleGenerationBatch => b != null)
  }
  return []
}

export function parseSeoTitleGeneratorPayload(raw: unknown): {
  variants: SeoTitleVariantWithId[]
  generation: SeoTitleGenerationBatch | null
} {
  const record = unwrapRecord(raw)
  if (!record) return { variants: [], generation: null }

  if (record.error && typeof record.error === 'string') {
    throw new Error(record.error)
  }

  let generation = normalizeSeoTitleGenerationBatch(record.generation)
  let variants = normalizeSeoTitleVariantsWithId(
    record.variants ?? record.titles ?? generation?.variants,
  )

  if (!generation && Array.isArray(record.rows)) {
    const rows = (record.rows as GeneratedSeoTitleRow[]).map(normalizeGeneratedSeoTitleRow)
    generation = batchFromRows(rows)
    variants = generation?.variants ?? variants
  }

  if (!variants.length && generation) variants = generation.variants

  return { variants, generation }
}

export function coerceErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  if (typeof err === 'string') return err
  return 'Ein unbekannter Fehler ist aufgetreten.'
}

export function isAiGenerationError(
  err: unknown,
): err is { code: string; message: string } {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err
}

export { normalizeGeneratedSeoTitleRow } from '@/lib/seo-title-db'
