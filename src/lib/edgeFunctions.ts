import { FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
import { supabase, isLocalSupabaseUrl, SUPABASE_URL } from './supabase'
import { readEnv } from '@/lib/env'
import { isDebugLoggingEnabled } from '@/lib/runtime'
import { coerceErrorMessage } from '@/lib/ai/parse-hooks-response'
import {
  formatPipelineError,
  formatEdgeFunctionNetworkError,
  type PipelineErrorPayload,
} from '@/lib/video-pipeline-errors'
import { logVideoPipelineError } from '@/lib/video-pipeline-messages'

type EdgeFunctionErrorBody = PipelineErrorPayload & {
  code?: string
  hooks?: unknown
  generation?: unknown
  generations?: unknown
  ok?: boolean
}

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

/** True when the JSON body is an error response (not a successful AI payload). */
function isFatalEdgePayload(payload: unknown): payload is EdgeFunctionErrorBody {
  if (!payload || typeof payload !== 'object') return false
  if (isCreditConsumeShape(payload)) return false

  const record = payload as EdgeFunctionErrorBody

  if (record.ok === true) return false
  if (Array.isArray(record.hooks) && record.hooks.length > 0) return false
  if (record.generation && typeof record.generation === 'object') return false
  if (Array.isArray(record.generations)) return false

  const errorText =
    typeof record.error === 'string'
      ? record.error.trim()
      : typeof record.message === 'string'
        ? record.message.trim()
        : ''

  return errorText.length > 0
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

async function extractResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type') ?? ''
  const text = await response.text()
  if (!text) return null

  if (contentType.includes('application/json') || text.trim().startsWith('{')) {
    try {
      return JSON.parse(text) as unknown
    } catch {
      return { error: text.slice(0, 500) }
    }
  }

  return { error: text.slice(0, 500) }
}

async function resolveInvokeResult<T>(
  functionName: string,
  data: unknown,
  error: Error | null,
): Promise<{ payload: T | null; httpStatus: number; invokeError: string | null }> {
  let httpStatus = 200
  let invokeError: string | null = null
  let payload = parseJsonBody<T & EdgeFunctionErrorBody>(data)

  if (error) {
    invokeError = coerceErrorMessage(error)

    if (error instanceof FunctionsHttpError && error.context) {
      httpStatus = error.context.status || 500
      if (payload == null) {
        try {
          payload = (await extractResponseBody(error.context)) as T & EdgeFunctionErrorBody
        } catch (readErr) {
          console.error(`[EdgeFunction] ${functionName} failed to read error body`, readErr)
        }
      }
    } else if (error instanceof FunctionsRelayError) {
      httpStatus = 502
    } else {
      httpStatus = 500
    }
  }

  return { payload, httpStatus, invokeError }
}

function throwEdgeInvokeError(
  functionName: string,
  status: number,
  body: unknown,
  fallback?: string,
): never {
  const technical = parseEdgeErrorForLog(functionName, status, body, fallback)

  console.error(`[EdgeFunction] ${functionName} failed`, {
    status,
    message: technical,
    body,
    fallback,
  })

  logVideoPipelineError(`edge-${functionName}`, technical, { status, body })

  if (status === 401 || technical.includes('AUTH_REQUIRED')) {
    throw new Error('AUTH_REQUIRED')
  }
  if (
    status === 402 ||
    technical.includes('insufficient_credits') ||
    (typeof body === 'object' &&
      body !== null &&
      (body as EdgeFunctionErrorBody).code === 'insufficient_credits')
  ) {
    throw new Error(`insufficient_credits: ${technical}`)
  }
  if (isNetworkFetchError(new Error(technical))) {
    throw new Error(formatEdgeFunctionNetworkError(functionName))
  }

  throw new Error(technical)
}

export async function invokeEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
  options?: InvokeEdgeFunctionOptions,
): Promise<T> {
  assertSupabaseConfigured()

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const session = sessionData?.session

  if (sessionError || !session?.access_token) {
    console.error(`[EdgeFunction] ${functionName} — no session`, sessionError)
    throw new Error('AUTH_REQUIRED')
  }

  const extraOk = options?.okStatuses ?? []
  const debug = isDebugLoggingEnabled()

  if (debug) {
    console.debug(`[EdgeFunction] ${functionName} → invoke`, {
      action: body.action,
      host: SUPABASE_URL ? new URL(SUPABASE_URL).host : 'unknown',
      body,
    })
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    body,
  })

  const { payload, httpStatus, invokeError } = await resolveInvokeResult<T>(
    functionName,
    data,
    error,
  )

  const isHttpError = Boolean(error) && httpStatus >= 400
  const allowedByStatus = extraOk.includes(httpStatus)

  if (isHttpError && !allowedByStatus) {
    throwEdgeInvokeError(functionName, httpStatus, payload, invokeError ?? undefined)
  }

  if (payload && isFatalEdgePayload(payload)) {
    throwEdgeInvokeError(functionName, httpStatus || 500, payload, invokeError ?? undefined)
  }

  if (payload !== null) {
    if (debug) {
      console.debug(`[EdgeFunction] ${functionName} ← success`, {
        status: httpStatus,
        keys: Object.keys(payload as object),
      })
    }
    return payload as T
  }

  if (error) {
    throwEdgeInvokeError(functionName, httpStatus, null, invokeError ?? undefined)
  }

  logVideoPipelineError(`edge-${functionName}`, 'Empty response', { httpStatus })
  throw new Error('EDGE_FUNCTION_EMPTY')
}
