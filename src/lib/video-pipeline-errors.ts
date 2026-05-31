import { classifyVideoFailure, getPremiumFailure, logVideoPipelineError } from '@/lib/video-pipeline-messages'

export type PipelineStep =
  | 'auth'
  | 'env'
  | 'queue'
  | 'prompt'
  | 'video_generation'
  | 'audio_generation'
  | 'upload'
  | 'storage'
  | 'compose'
  | 'poll'
  | 'history'
  | 'unknown'

export type PipelineErrorPayload = {
  error?: string
  message?: string
  step?: string
  details?: Record<string, unknown>
}

/** Internal/throw helper — logs to console, returns technical string for Error objects. */
export function formatPipelineError(
  payload: PipelineErrorPayload | null | undefined,
  fallback?: string,
  functionName?: string,
): string {
  const raw =
    errorValueToString(payload?.error) ||
    errorValueToString(payload?.message) ||
    fallback ||
    'Unknown pipeline error'

  logVideoPipelineError('formatPipelineError', raw, {
    functionName,
    step: payload?.step,
    details: payload?.details,
  })

  return raw
}

/** @deprecated Use logVideoPipelineError + throw — kept for edge function invoke paths. */
export function formatEdgeFunctionNetworkError(functionName: string): string {
  logVideoPipelineError('edge-function-network', 'Network or unreachable edge function', {
    functionName,
    url: import.meta.env.VITE_SUPABASE_URL,
  })
  return 'EDGE_FUNCTION_UNREACHABLE'
}

export type PremiumVideoError = {
  kind: 'exhausted' | 'credits' | 'auth'
  title: string
  message: string
  retryable: boolean
}

/** Always returns premium copy safe for UI — never deploy hints or env vars. */
export function formatUserFacingVideoError(error: unknown): PremiumVideoError {
  logVideoPipelineError('user-facing-wrap', error)

  const kind = classifyVideoFailure(error)
  const copy = getPremiumFailure(kind)

  return {
    kind,
    title: copy.title,
    message: copy.description,
    retryable: kind === 'exhausted',
  }
}

function errorValueToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.message
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    if (typeof record.error === 'string') return record.error
    try {
      return JSON.stringify(value)
    } catch {
      return 'Unknown error'
    }
  }
  return String(value)
}
