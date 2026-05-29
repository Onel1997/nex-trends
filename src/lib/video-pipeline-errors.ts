/** Maps structured edge-function pipeline errors to user-facing copy. */

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

const STEP_LABELS: Record<PipelineStep, string> = {
  auth: 'Authentifizierung',
  env: 'Server-Konfiguration',
  queue: 'Warteschlange',
  prompt: 'Prompt / Briefing',
  video_generation: 'KI-Video (Replicate/Luma)',
  audio_generation: 'Voiceover (OpenAI)',
  upload: 'Upload',
  storage: 'Supabase Storage',
  compose: 'Finalisierung',
  poll: 'Status-Abfrage',
  history: 'Verlauf',
  unknown: 'Pipeline',
}

export type PipelineErrorPayload = {
  error?: string
  message?: string
  step?: string
  details?: Record<string, unknown>
}

export function formatEdgeFunctionNetworkError(functionName: string): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
  const host = (() => {
    try {
      return new URL(baseUrl).host
    } catch {
      return baseUrl || 'dein Supabase-Projekt'
    }
  })()

  return (
    `Die Edge Function „${functionName}“ ist nicht erreichbar. ` +
    `Prüfe: (1) VITE_SUPABASE_URL zeigt auf https://<ref>.supabase.co (aktuell: ${host}), ` +
    `(2) Function deployed: supabase functions deploy ${functionName}, ` +
    '(3) Im Dashboard unter Edge Functions sichtbar, (4) Du bist angemeldet.'
  )
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
      return 'Unbekannter Fehler'
    }
  }
  return String(value)
}

export function formatPipelineError(
  payload: PipelineErrorPayload | null | undefined,
  fallback?: string,
  functionName?: string,
): string {
  const raw =
    errorValueToString(payload?.error) ||
    errorValueToString(payload?.message) ||
    fallback ||
    'Unbekannter Fehler'
  const step = (payload?.step ?? 'unknown') as PipelineStep
  const label = STEP_LABELS[step] ?? step

  if (payload?.step && payload?.error) {
    let msg = `${label}: ${errorValueToString(payload.error)}`

    const details = payload.details
    if (details && import.meta.env.DEV) {
      const hint = details.missing as string[] | undefined
      if (hint?.length) {
        msg += ` (fehlend: ${hint.join(', ')})`
      }
      if (typeof details.provider === 'string') {
        msg += ` [${details.provider}]`
      }
    }

    return msg
  }

  if (
    raw.toLowerCase().includes('load failed') ||
    raw.includes('Failed to fetch') ||
    raw.includes('Failed to send a request')
  ) {
    return formatEdgeFunctionNetworkError(functionName ?? 'edge-function')
  }

  return raw
}
