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

export function formatPipelineError(
  payload: PipelineErrorPayload | null | undefined,
  fallback?: string,
): string {
  const raw = payload?.error ?? payload?.message ?? fallback ?? 'Unbekannter Fehler'
  const step = (payload?.step ?? 'unknown') as PipelineStep
  const label = STEP_LABELS[step] ?? step

  if (payload?.step && payload?.error) {
    let msg = `${label}: ${payload.error}`

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
    return (
      'Die Edge Function „generate-video“ ist nicht erreichbar (Netzwerk/CORS). ' +
      'Bitte deployen: supabase functions deploy generate-video — und ' +
      'VITE_SUPABASE_URL prüfen.'
    )
  }

  return raw
}
