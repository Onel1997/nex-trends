import { supabase } from './supabase'

type EdgeFunctionErrorBody = {
  error?: string
  message?: string
}

function getSupabaseFunctionsUrl(functionName: string): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!baseUrl || !anonKey) {
    throw new Error(
      'Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY prüfen.',
    )
  }

  return `${baseUrl.replace(/\/$/, '')}/functions/v1/${functionName}`
}

function parseEdgeErrorMessage(
  functionName: string,
  status: number,
  body: EdgeFunctionErrorBody | null,
  fallback?: string,
): string {
  const detail = body?.error ?? body?.message

  if (detail) return detail

  const fb = fallback ?? ''

  if (
    fb.toLowerCase().includes('load failed') ||
    fb.includes('Failed to fetch') ||
    fb.includes('Failed to send a request')
  ) {
    return `Die Edge Function „${functionName}“ ist nicht erreichbar. Bitte deployen: supabase functions deploy ${functionName}`
  }

  if (status === 401) return 'Sitzung abgelaufen. Bitte melde dich erneut an.'
  if (status === 404) {
    return `Die Edge Function „${functionName}“ wurde nicht gefunden. Bitte Deployment prüfen: supabase functions deploy ${functionName}`
  }

  return fb || `Anfrage an ${functionName} fehlgeschlagen (HTTP ${status}).`
}

export async function invokeEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
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

  if (import.meta.env.DEV || import.meta.env.VITE_ADMIN_DEBUG === 'true') {
    console.debug(`[EdgeFunction] ${functionName} → POST`, { action: body.action })
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

    let payload: (T & EdgeFunctionErrorBody) | null = null

    try {
      payload = (await response.json()) as T & EdgeFunctionErrorBody
    } catch {
      payload = null
    }

    if (!response.ok) {
      console.error(`[EdgeFunction] ${functionName} HTTP ${response.status}`, payload)
      throw new Error(parseEdgeErrorMessage(functionName, response.status, payload))
    }

    if (payload && typeof payload === 'object' && payload.error) {
      throw new Error(payload.error)
    }

    return payload as T
  } catch (err) {
    if (err instanceof Error && !err.message.includes('Failed to fetch')) {
      throw err
    }

    console.warn(`[EdgeFunction] ${functionName} fetch failed, trying SDK invoke`, err)

    // Fallback: Supabase SDK invoke (manche Umgebungen blockieren direktes fetch)
    const { data, error } = await supabase.functions.invoke(functionName, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body,
    })

    if (error) {
      const sdkBody = data as EdgeFunctionErrorBody | null
      throw new Error(
        parseEdgeErrorMessage(functionName, 0, sdkBody, error.message),
      )
    }

    const result = data as T & EdgeFunctionErrorBody

    if (result && typeof result === 'object' && result.error) {
      throw new Error(result.error)
    }

    return result as T
  }
}
