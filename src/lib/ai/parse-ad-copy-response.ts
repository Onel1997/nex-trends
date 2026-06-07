import {
  batchFromRows,
  groupRowsIntoBatches,
  normalizeGeneratedAdCopyRow,
} from '@/lib/ad-copy-db'
import type {
  AdCopyGenerationBatch,
  AdCopyVariant,
  AdCopyVariantWithId,
  GeneratedAdCopyRow,
} from '@/types/ad-copy-generation'

const INVALID_DISPLAY_STRINGS = new Set(['[object Object]', '[object Array]'])

function isUsableString(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length > 0 && !INVALID_DISPLAY_STRINGS.has(trimmed)
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && isUsableString(value)) {
      return value.trim()
    }
  }
  return ''
}

export function coerceAdCopyVariant(item: unknown): AdCopyVariant | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null

  const record = item as Record<string, unknown>
  const headline = pickString(record, ['headline', 'title', 'head'])
  const primaryText = pickString(record, [
    'primaryText',
    'primary_text',
    'primary',
    'body',
    'text',
    'description',
  ])
  const cta = pickString(record, ['cta', 'callToAction', 'call_to_action', 'button'])

  if (!headline && !primaryText && !cta) return null

  return {
    headline: headline || primaryText.slice(0, 60) || 'Dein Headline',
    primaryText: primaryText || headline,
    cta: cta || 'Jetzt starten',
  }
}

function coerceVariantWithId(item: unknown): AdCopyVariantWithId | null {
  const base = coerceAdCopyVariant(item)
  if (!base) return null

  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return {
      ...base,
      id: `parsed-${Date.now()}`,
      character_count: base.headline.length + base.primaryText.length + base.cta.length,
      is_saved: false,
    }
  }

  const record = item as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : `parsed-${Date.now()}`
  const character_count =
    typeof record.character_count === 'number'
      ? record.character_count
      : base.headline.length + base.primaryText.length + base.cta.length
  const is_saved = record.is_saved === true

  return { ...base, id, character_count, is_saved }
}

function unwrapRecord(value: unknown): Record<string, unknown> | null {
  if (value == null) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      return unwrapRecord(JSON.parse(trimmed) as unknown)
    } catch {
      return null
    }
  }

  if (typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function normalizeAdCopyVariants(value: unknown): AdCopyVariant[] {
  if (value == null) return []

  if (Array.isArray(value)) {
    const seen = new Set<string>()
    const variants: AdCopyVariant[] = []

    for (const item of value) {
      const variant = coerceAdCopyVariant(item)
      if (!variant) continue
      const key = `${variant.headline}|||${variant.primaryText}|||${variant.cta}`
      if (seen.has(key)) continue
      seen.add(key)
      variants.push(variant)
    }

    return variants
  }

  const record = unwrapRecord(value)
  if (!record) return []

  if (Array.isArray(record.rows)) {
    return normalizeAdCopyVariants(record.rows)
  }
  if (Array.isArray(record.ads)) return normalizeAdCopyVariants(record.ads)
  if (Array.isArray(record.variants)) return normalizeAdCopyVariants(record.variants)
  if (Array.isArray(record.generated_ads_json)) {
    return normalizeAdCopyVariants(record.generated_ads_json)
  }

  return []
}

export function normalizeAdCopyVariantsWithId(value: unknown): AdCopyVariantWithId[] {
  if (value == null) return []

  if (Array.isArray(value)) {
    return value
      .map(coerceVariantWithId)
      .filter((v): v is AdCopyVariantWithId => v != null)
  }

  const record = unwrapRecord(value)
  if (!record) return []

  if (Array.isArray(record.rows)) return normalizeAdCopyVariantsWithId(record.rows)
  if (Array.isArray(record.variants)) return normalizeAdCopyVariantsWithId(record.variants)
  if (Array.isArray(record.ads)) return normalizeAdCopyVariantsWithId(record.ads)

  return []
}

export function normalizeAdCopyGenerationBatch(value: unknown): AdCopyGenerationBatch | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>

  if (Array.isArray(record.rows)) {
    const rows = (record.rows as GeneratedAdCopyRow[]).map(normalizeGeneratedAdCopyRow)
    return batchFromRows(rows)
  }

  const id = typeof record.id === 'string' ? record.id : ''
  const briefing = typeof record.briefing === 'string' ? record.briefing : ''
  const tone = typeof record.tone === 'string' ? record.tone : ''
  const platform = typeof record.platform === 'string' ? record.platform : ''
  const created_at = typeof record.created_at === 'string' ? record.created_at : new Date().toISOString()
  const variants = normalizeAdCopyVariantsWithId(record.variants ?? record.ads)

  if (!id || variants.length === 0) return null

  return { id, briefing, tone, platform, created_at, variants }
}

export function normalizeAdCopyHistoryBatches(value: unknown): AdCopyGenerationBatch[] {
  if (value == null) return []

  if (Array.isArray(value)) {
    if (value.length === 0) return []

    const first = value[0]
    if (first && typeof first === 'object' && 'generation_batch_id' in (first as object)) {
      return groupRowsIntoBatches(
        (value as GeneratedAdCopyRow[]).map(normalizeGeneratedAdCopyRow),
      )
    }

    return value
      .map(normalizeAdCopyGenerationBatch)
      .filter((b): b is AdCopyGenerationBatch => b != null)
  }

  const record = unwrapRecord(value)
  if (!record) return []

  if (Array.isArray(record.generations)) {
    return normalizeAdCopyHistoryBatches(record.generations)
  }
  if (Array.isArray(record.rows)) {
    return groupRowsIntoBatches(
      (record.rows as GeneratedAdCopyRow[]).map(normalizeGeneratedAdCopyRow),
    )
  }

  const batch = normalizeAdCopyGenerationBatch(record)
  return batch ? [batch] : []
}

export type ParsedAdCopyGeneratorPayload = {
  variants: AdCopyVariantWithId[]
  generation?: AdCopyGenerationBatch
}

export function parseAdCopyGeneratorPayload(payload: unknown): ParsedAdCopyGeneratorPayload {
  if (payload == null) {
    throw new Error('Leere Antwort vom Ad Copy Generator.')
  }

  if (typeof payload === 'string') {
    try {
      return parseAdCopyGeneratorPayload(JSON.parse(payload) as unknown)
    } catch {
      throw new Error('Server-Antwort konnte nicht als JSON gelesen werden.')
    }
  }

  if (typeof payload !== 'object') {
    throw new Error('Ungültige Antwort vom Ad Copy Generator.')
  }

  const body = unwrapRecord(payload) ?? (payload as Record<string, unknown>)

  if (
    body.error != null &&
    body.error !== '' &&
    !Array.isArray(body.ads) &&
    !Array.isArray(body.variants) &&
    !Array.isArray(body.rows)
  ) {
    throw new Error(coerceErrorMessage(body.error))
  }

  const generation = normalizeAdCopyGenerationBatch(body.generation) ??
    (Array.isArray(body.rows)
      ? batchFromRows((body.rows as GeneratedAdCopyRow[]).map(normalizeGeneratedAdCopyRow))
      : null)

  let variants = normalizeAdCopyVariantsWithId(body.variants ?? body.ads ?? body.rows)
  if (variants.length === 0 && generation) {
    variants = generation.variants
  }

  if (variants.length === 0) {
    throw new Error('Keine Ad Copy Varianten in der Server-Antwort gefunden.')
  }

  return {
    variants,
    generation: generation ?? undefined,
  }
}

export function coerceErrorMessage(value: unknown): string {
  if (value == null) return 'Unbekannter Fehler.'
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || INVALID_DISPLAY_STRINGS.has(trimmed)) {
      return 'Unbekannter Fehler.'
    }
    return trimmed
  }
  if (value instanceof Error) {
    const msg = value.message?.trim()
    if (!msg || INVALID_DISPLAY_STRINGS.has(msg)) {
      return coerceErrorMessage((value as Error & { cause?: unknown }).cause)
    }
    return msg
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>

    if (typeof record.message === 'string') {
      return coerceErrorMessage(record.message)
    }
    if (typeof record.error === 'string') {
      return coerceErrorMessage(record.error)
    }
    if (record.error != null) {
      return coerceErrorMessage(record.error)
    }
  }

  return 'Generierung fehlgeschlagen.'
}

export function isAiGenerationError(
  err: unknown,
): err is { code: string; message: string; retryAfterMs?: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err
  )
}

export { normalizeGeneratedAdCopyRow } from '@/lib/ad-copy-db'
