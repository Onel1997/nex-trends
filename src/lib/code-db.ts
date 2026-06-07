import type {
  CodeGeneration,
  CodeGenerationRequest,
  GeneratedCodeRow,
} from '@/types/code-generation'

export function isCodeTableUnavailableError(err: unknown): boolean {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err ?? '')

  return (
    message.includes('relation "public.generated_code" does not exist') ||
    (message.includes('generated_code') && message.includes('does not exist'))
  )
}

export function normalizeGeneratedCodeRow(row: GeneratedCodeRow): CodeGeneration {
  return {
    id: row.id,
    projectDescription: row.project_description,
    framework: row.framework,
    outputType: row.output_type,
    code: row.code_content,
    language: row.language || 'typescript',
    createdAt: row.created_at,
  }
}

export function normalizeCodeGeneration(value: unknown): CodeGeneration | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>

  const id = typeof record.id === 'string' ? record.id : ''
  const code =
    typeof record.code === 'string'
      ? record.code
      : typeof record.code_content === 'string'
        ? record.code_content
        : ''

  if (!code.trim()) return null

  return {
    id: id || `ephemeral-${Date.now()}`,
    projectDescription:
      typeof record.projectDescription === 'string'
        ? record.projectDescription
        : typeof record.project_description === 'string'
          ? record.project_description
          : '',
    framework: typeof record.framework === 'string' ? record.framework : 'React',
    outputType:
      typeof record.outputType === 'string'
        ? record.outputType
        : typeof record.output_type === 'string'
          ? record.output_type
          : 'Component',
    code: code.trim(),
    language: typeof record.language === 'string' ? record.language : 'typescript',
    createdAt:
      typeof record.createdAt === 'string'
        ? record.createdAt
        : typeof record.created_at === 'string'
          ? record.created_at
          : new Date().toISOString(),
  }
}

export function createEphemeralCodeResult(
  request: CodeGenerationRequest,
  code: string,
  language: string,
): CodeGeneration {
  return {
    id: `ephemeral-${Date.now()}`,
    projectDescription: request.projectDescription,
    framework: request.framework,
    outputType: request.outputType,
    code,
    language,
    createdAt: new Date().toISOString(),
  }
}
