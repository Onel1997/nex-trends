import { supabase, isLocalSupabaseUrl, SUPABASE_URL } from './supabase'
import { readEnv } from '@/lib/env'
import { coerceErrorMessage } from '@/lib/ai/parse-hooks-response'
import {
  formatPipelineError,
  formatEdgeFunctionNetworkError,
  type PipelineErrorPayload,
} from '@/lib/video-pipeline-errors'
import { logVideoPipelineError } from '@/lib/video-pipeline-messages'

type EdgeFunctionErrorBody = PipelineErrorPayload

export type InvokeEdgeFunctionOptions = {
  okStatuses?: number[]
}

function assertSupabaseConfigured(): void {
  const baseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL')
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')

  if (!baseUrl || !anonKey) {
    logVideoPipelineError('env-missing', 'Supabase env not configured', { baseUrl: !!baseUrl })
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }

  if (isLocalSupabaseUrl(baseUrl)) {
    logVideoPipelineError('env-local', 'Local Supabase URL in production client', { baseUrl })
    throw new Error('SUPABASE_LOCAL_URL')
  }
}

function isCreditConsumeShape(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'allowed' in payload &&
    typeof (payload as { allowed: unknown }).allowed === 'boolean'
  )
}

function isFatalEdgePayload(payload: unknown): payload is EdgeFunctionErrorBody {
  if (!payload || typeof payload !== 'object') return false
  if (isCreditConsumeShape(payload)) return false
  const record = payload as Record<string, unknown>
  return typeof record.error === 'string' || typeof record.message === 'string'
}

function parseEdgeErrorForLog(
  functionName: string,
  status: number,
  body: unknown,
  fallback?: string,
): string {
  const payload = body as EdgeFunctionErrorBody | null
  if (payload && isFatalEdgePayload(payload)) {
    return formatPipelineError(payload, fallback, functionName)
  }
  if (isCreditConsumeShape(body)) {
    const credit = body as { error?: string }
    if (credit.error) return credit.error
  }
  return coerceErrorMessage(fallback) || `HTTP ${status} from ${functionName}`
}

function throwVideoEdgeError(
  functionName: string,
  status: number,
  body: unknown,
  fallback?: string,
): never {
  const technical = parseEdgeErrorForLog(functionName, status, body, fallback)
  logVideoPipelineError(`edge-${functionName}`, technical, { status, body })

  if (status === 401) throw new Error('AUTH_REQUIRED')
  if (status === 402) throw new Error('insufficient_credits')
  if (isNetworkFetchError(new Error(technical))) {
    throw new Error(formatEdgeFunctionNetworkError(functionName))
  }
  throw new Error('EDGE_FUNCTION_ERROR')
}

function isNetworkFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('networkerror') ||
    msg.includes('failed to send a request') ||
    msg.includes('edge_function_unreachable')
  )
}

function parseJsonBody<T>(raw: unknown): T | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  if (typeof raw === 'object') return raw as T
  return null
}

function extractFunctionsErrorStatus(error: { context?: Response } & Error): number {
  return error.context?.status ?? 0
}

export async function invokeEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
  options?: InvokeEdgeFunctionOptions,
): Promise<T> {
  assertSupabaseConfigured()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error('AUTH_REQUIRED')
  }

  const extraOk = options?.okStatuses ?? []

  const debug =
    import.meta.env.DEV ||
    import.meta.env.VITE_ADMIN_DEBUG === 'true' ||
    import.meta.env.VITE_VIDEO_DEBUG === 'true'

  if (debug) {
    console.debug(`[EdgeFunction] ${functionName} → invoke`, {
      action: body.action,
      supabaseHost: new URL(SUPABASE_URL).host,
    })
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    body,
  })

  const payload = parseJsonBody<T & EdgeFunctionErrorBody>(data) ?? (data as T | null)
  const httpStatus = error ? extractFunctionsErrorStatus(error as Error & { context?: Response }) : 200

  if (error) {
    if (extraOk.includes(httpStatus) && payload !== null) {
      return payload as T
    }
    throwVideoEdgeError(functionName, httpStatus, payload, coerceErrorMessage(error))
  }

  if (payload && isFatalEdgePayload(payload)) {
    throwVideoEdgeError(functionName, httpStatus || 500, payload)
  }

  if (payload !== null) {
    return payload as T
  }

  logVideoPipelineError(`edge-${functionName}`, 'Empty response')
  throw new Error('EDGE_FUNCTION_EMPTY')
}
