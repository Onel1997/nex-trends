import { supabase, isLocalSupabaseUrl, SUPABASE_URL } from './supabase'
import { coerceErrorMessage } from '@/lib/ai/parse-hooks-response'
import {
  formatPipelineError,
  formatEdgeFunctionNetworkError,
  type PipelineErrorPayload,
} from '@/lib/video-pipeline-errors'

type EdgeFunctionErrorBody = PipelineErrorPayload

export type InvokeEdgeFunctionOptions = {
  /** HTTP statuses that return parsed JSON instead of throwing (e.g. 402 for credits). */
  okStatuses?: number[]
}

function getSupabaseFunctionsUrl(functionName: string): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!baseUrl || !anonKey) {
    throw new Error(
      'Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env setzen.',
    )
  }

  if (isLocalSupabaseUrl(baseUrl)) {
    throw new Error(
      `Edge Functions laufen nicht auf lokalem Supabase (${baseUrl}). ` +
        'Setze VITE_SUPABASE_URL auf https://<project-ref>.supabase.co (Dashboard → Settings → API).',
    )
  }

  return `${baseUrl.replace(/\/$/, '')}/functions/v1/${functionName}`
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

function parseEdgeErrorMessage(
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

  const fb = coerceErrorMessage(fallback)

  if (status === 401) return 'Sitzung abgelaufen. Bitte melde dich erneut an.'
  if (status === 404) {
    return (
      `Die Edge Function „${functionName}“ ist nicht deployed. ` +
      `Deploy: supabase functions deploy ${functionName}`
    )
  }

  return (
    formatPipelineError({ error: fb }, fb, functionName) ||
    `Anfrage an „${functionName}“ fehlgeschlagen (HTTP ${status}).`
  )
}

function isNetworkFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('networkerror') ||
    msg.includes('failed to send a request')
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

export async function invokeEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
  options?: InvokeEdgeFunctionOptions,
): Promise<T> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    throw new Error('Nicht authentifiziert. Bitte melde dich erneut an.')
  }

  const url = getSupabaseFunctionsUrl(functionName)
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!.trim()
  const extraOk = options?.okStatuses ?? []

  const debug =
    import.meta.env.DEV ||
    import.meta.env.VITE_ADMIN_DEBUG === 'true' ||
    import.meta.env.VITE_VIDEO_DEBUG === 'true'

  if (debug) {
    console.debug(`[EdgeFunction] ${functionName} → POST ${url}`, {
      action: body.action,
      supabaseHost: new URL(SUPABASE_URL).host,
    })
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    let payload: T | null = null

    try {
      payload = (await response.json()) as T
    } catch {
      payload = null
    }

    const isAcceptedStatus =
      response.ok || extraOk.includes(response.status)

    if (isAcceptedStatus && payload !== null) {
      if (isFatalEdgePayload(payload)) {
        throw new Error(formatPipelineError(payload, undefined, functionName))
      }
      return payload
    }

    if (!response.ok) {
      console.error(`[EdgeFunction] ${functionName} HTTP ${response.status}`, payload)
      throw new Error(
        parseEdgeErrorMessage(functionName, response.status, payload),
      )
    }

    throw new Error(
      `Leere Antwort von „${functionName}“ (HTTP ${response.status}).`,
    )
  } catch (err) {
    if (err instanceof Error && !isNetworkFetchError(err)) {
      throw err
    }

    console.warn(`[EdgeFunction] ${functionName} fetch failed, trying SDK invoke`, err)

    const { data, error } = await supabase.functions.invoke(functionName, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body,
    })

    if (error) {
      const sdkBody = parseJsonBody<EdgeFunctionErrorBody & T>(data) ?? (data as T | null)
      const sdkMessage = parseEdgeErrorMessage(
        functionName,
        0,
        sdkBody,
        coerceErrorMessage(error),
      )
      if (
        isNetworkFetchError(error) ||
        sdkMessage.toLowerCase().includes('failed to fetch') ||
        sdkMessage.includes('nicht erreichbar')
      ) {
        throw new Error(formatEdgeFunctionNetworkError(functionName))
      }
      throw new Error(sdkMessage)
    }

    const result = parseJsonBody<T & EdgeFunctionErrorBody>(data) ?? (data as T)

    if (result && isFatalEdgePayload(result)) {
      throw new Error(formatPipelineError(result, undefined, functionName))
    }

    return result as T
  }
}
