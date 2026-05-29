import type { GeneratedHooksRow } from '@/types/ai-generation'

const HOOK_OBJECT_KEYS = [
  'hook',
  'text',
  'content',
  'headline',
  'title',
  'value',
  'hook_text',
  'hookText',
  'line',
  'script',
  'copy',
  'hook_line',
  'scroll_stopper',
  'scrollStopper',
  'caption',
] as const

const INVALID_DISPLAY_STRINGS = new Set(['[object Object]', '[object Array]'])

function isUsableDisplayString(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length > 0 && !INVALID_DISPLAY_STRINGS.has(trimmed)
}

/** Coerce a single hook item (string or OpenAI object shape) to display text. */
export function coerceHookText(item: unknown): string | null {
  if (typeof item === 'string') {
    const trimmed = item.trim()
    return isUsableDisplayString(trimmed) ? trimmed : null
  }

  if (typeof item === 'number' || typeof item === 'boolean') {
    const text = String(item).trim()
    return isUsableDisplayString(text) ? text : null
  }

  if (!item || typeof item !== 'object') return null

  const record = item as Record<string, unknown>

  for (const key of HOOK_OBJECT_KEYS) {
    const value = record[key]
    if (typeof value === 'string' && isUsableDisplayString(value)) {
      return value.trim()
    }
  }

  const stringValues = Object.values(record).filter(
    (v): v is string => typeof v === 'string' && isUsableDisplayString(v),
  )

  if (stringValues.length === 1) {
    return stringValues[0].trim()
  }

  if (stringValues.length > 1) {
    return stringValues.sort((a, b) => b.length - a.length)[0].trim()
  }

  return null
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

  const record = value as Record<string, unknown>

  if (
    record.data &&
    typeof record.data === 'object' &&
    !Array.isArray(record.data) &&
  !('hooks' in record)
  ) {
    return record.data as Record<string, unknown>
  }

  return record
}

/** Normalize hooks from API, DB JSON, or nested OpenAI shapes → string[]. */
export function normalizeHooksList(value: unknown): string[] {
  if (value == null) return []

  const record = unwrapRecord(value)
  if (record) {
    if (Array.isArray(record.hooks)) {
      return normalizeHooksList(record.hooks)
    }
    if (Array.isArray(record.generated_hooks_json)) {
      return normalizeHooksList(record.generated_hooks_json)
    }
    if (record.data != null) {
      const nested = normalizeHooksList(record.data)
      if (nested.length > 0) return nested
    }
    if (record.result != null) {
      const nested = normalizeHooksList(record.result)
      if (nested.length > 0) return nested
    }
  }

  let source: unknown = value

  if (typeof source === 'string') {
    const trimmed = source.trim()
    if (!trimmed) return []
    try {
      source = JSON.parse(trimmed) as unknown
      return normalizeHooksList(source)
    } catch {
      return isUsableDisplayString(trimmed) ? [trimmed] : []
    }
  }

  if (Array.isArray(source)) {
    const seen = new Set<string>()
    const hooks: string[] = []

    for (const item of source) {
      const text = coerceHookText(item)
      if (text && !seen.has(text)) {
        seen.add(text)
        hooks.push(text)
      }
    }

    return hooks
  }

  if (typeof source === 'object' && source !== null) {
    const obj = source as Record<string, unknown>

    if (Array.isArray(obj.hooks)) {
      return normalizeHooksList(obj.hooks)
    }
    if (Array.isArray(obj.generated_hooks_json)) {
      return normalizeHooksList(obj.generated_hooks_json)
    }

    const values = Object.values(obj)
    if (values.length > 0 && values.every((v) => typeof v === 'string' || typeof v === 'object')) {
      const fromValues = normalizeHooksList(values)
      if (fromValues.length > 0) return fromValues
    }
  }

  const single = coerceHookText(source)
  return single ? [single] : []
}

export function normalizeGeneratedHooksRow(row: GeneratedHooksRow): GeneratedHooksRow {
  return {
    ...row,
    generated_hooks_json: normalizeHooksList(row.generated_hooks_json),
  }
}

export type ParsedHookGeneratorPayload = {
  hooks: string[]
  generation?: GeneratedHooksRow
}

/** Parse hook-generator edge function JSON into typed, display-safe hooks. */
export function parseHookGeneratorPayload(payload: unknown): ParsedHookGeneratorPayload {
  if (payload == null) {
    throw new Error('Leere Antwort vom Hook Generator.')
  }

  if (typeof payload === 'string') {
    try {
      return parseHookGeneratorPayload(JSON.parse(payload) as unknown)
    } catch {
      throw new Error('Server-Antwort konnte nicht als JSON gelesen werden.')
    }
  }

  if (typeof payload !== 'object') {
    throw new Error('Ungültige Antwort vom Hook Generator.')
  }

  const body = unwrapRecord(payload) ?? (payload as Record<string, unknown>)

  if (body.error != null && body.error !== '' && !Array.isArray(body.hooks)) {
    throw new Error(coerceErrorMessage(body.error))
  }

  const generationRaw = body.generation
  const generation =
    generationRaw && typeof generationRaw === 'object'
      ? normalizeGeneratedHooksRow(generationRaw as GeneratedHooksRow)
      : undefined

  const hooks = normalizeHooksList(
    body.hooks ??
      body.data ??
      body.result ??
      generation?.generated_hooks_json,
  )

  if (hooks.length === 0) {
    throw new Error('Keine Hooks in der Server-Antwort gefunden.')
  }

  return { hooks, generation }
}

/** Turn API / OpenAI / thrown values into a user-visible string (never [object Object]). */
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
    if (typeof record.details === 'string') {
      return coerceErrorMessage(record.details)
    }
    if (record.details && typeof record.details === 'object') {
      return coerceErrorMessage(record.details)
    }

    try {
      const json = JSON.stringify(value, null, 0)
      if (json && json !== '{}' && json !== '[]' && !INVALID_DISPLAY_STRINGS.has(json)) {
        return json.length > 280 ? `${json.slice(0, 277)}…` : json
      }
    } catch {
      /* fall through */
    }
  }

  return 'Generierung fehlgeschlagen.'
}

/** Safe text for hook cards — never returns [object Object]. */
export function formatHookDisplayText(value: unknown): string {
  return coerceHookText(value) ?? ''
}
