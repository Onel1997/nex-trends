import {
  createEphemeralCodeResult,
  normalizeCodeGeneration,
  normalizeGeneratedCodeRow,
} from '@/lib/code-db'
import type {
  CodeGeneration,
  CodeGenerationRequest,
  CodeGenerationResult,
  GeneratedCodeRow,
} from '@/types/code-generation'

export function coerceErrorMessage(value: unknown): string {
  if (value == null) return 'Unbekannter Fehler.'
  if (typeof value === 'string') return value.trim() || 'Unbekannter Fehler.'
  if (value instanceof Error) return value.message.trim() || 'Unbekannter Fehler.'
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.message === 'string') return record.message.trim()
    if (typeof record.error === 'string') return record.error.trim()
  }
  return 'Unbekannter Fehler.'
}

export type AiGenerationError = {
  code: string
  message: string
}

export function isAiGenerationError(err: unknown): err is AiGenerationError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    typeof (err as AiGenerationError).code === 'string' &&
    typeof (err as AiGenerationError).message === 'string'
  )
}

export function parseCodeGeneratorPayload(payload: unknown): CodeGenerationResult {
  if (payload == null) {
    throw new Error('Leere Antwort vom Code Generator.')
  }

  if (typeof payload === 'string') {
    try {
      return parseCodeGeneratorPayload(JSON.parse(payload) as unknown)
    } catch {
      throw new Error('Server-Antwort konnte nicht als JSON gelesen werden.')
    }
  }

  if (typeof payload !== 'object') {
    throw new Error('Ungültige Antwort vom Code Generator.')
  }

  const body = payload as Record<string, unknown>

  if (
    body.error != null &&
    body.error !== '' &&
    typeof body.code !== 'string' &&
    body.generation == null
  ) {
    throw new Error(coerceErrorMessage(body.error))
  }

  const generation =
    normalizeCodeGeneration(body.generation) ??
    (typeof body.code === 'string'
      ? normalizeCodeGeneration({
          id: body.id,
          code: body.code,
          language: body.language,
          projectDescription: body.projectDescription ?? body.project_description,
          framework: body.framework,
          outputType: body.outputType ?? body.output_type,
          createdAt: body.createdAt ?? body.created_at,
        })
      : null)

  if (!generation) {
    throw new Error('Kein Code in der Server-Antwort gefunden.')
  }

  const summary = typeof body.summary === 'string' ? body.summary.trim() : undefined

  return { generation, summary }
}

export function normalizeCodeHistory(rows: unknown): CodeGeneration[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const record = row as GeneratedCodeRow | CodeGeneration
      if ('code_content' in record) {
        return normalizeGeneratedCodeRow(record as GeneratedCodeRow)
      }
      return normalizeCodeGeneration(record)
    })
    .filter((item): item is CodeGeneration => item != null)
}

export { createEphemeralCodeResult }
