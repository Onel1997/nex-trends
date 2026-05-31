/** Premium UI copy for the Creator OS strategy pipeline. */

export const PREMIUM_PIPELINE_MESSAGES = {
  crafting: [
    'Analysiere Viral-Struktur...',
    'Berechne Hook-Potenzial...',
    'Generiere Storyboard...',
    'Optimiere Retention...',
    'Baue CTA Sequenz...',
  ],
  rendering: [
    'OpenAI Strategist analysiert Trend...',
    'Creative Director strukturiert Szenen...',
    'Shot-List & Captions werden erstellt...',
    'Voiceover-Skript wird geschrieben...',
    'Posting-Strategie wird optimiert...',
    'Finalisiere Creator Blueprint...',
  ],
  retry: [
    'Temporäre Verzögerung — erneuter Versuch...',
    'AI Pipeline wird neu synchronisiert...',
    'Creator Engine stellt Verbindung wieder her...',
  ],
  success: 'Creator Blueprint bereit.',
} as const

export const PREMIUM_FAILURE = {
  exhausted: {
    title: 'Creator Blueprint vorübergehend nicht verfügbar',
    description:
      'Die AI-Strategie-Pipeline verarbeitet gerade viele Anfragen. Bitte versuche es erneut.',
  },
  credits: {
    title: 'Credits aufgebraucht',
    description: 'Upgrade deinen Plan oder warte auf die wöchentliche Auffüllung.',
  },
  auth: {
    title: 'Anmeldung erforderlich',
    description: 'Bitte melde dich erneut an, um Videos zu generieren.',
  },
} as const

export type VideoFailureKind = keyof typeof PREMIUM_FAILURE

const TECHNICAL_MARKERS = [
  'vite_supabase',
  'supabase',
  'edge function',
  'deploy',
  'http ',
  'http/',
  'failed to fetch',
  'load failed',
  'networkerror',
  'replicate',
  'openai',
  'postgres',
  'row level',
  'provider',
  'storage',
  'pipeline:',
  'nicht deployed',
  'nicht erreichbar',
  'project-ref',
  'functions/v1',
  'stack',
  'token',
  'env',
  '502',
  '404',
  '401',
  '402',
  '500',
  'jwt',
  'zeitüberschreitung',
  'poll fehlgeschlagen',
  'retry fehlgeschlagen',
  'video-job',
]

function isTechnicalMessage(raw: string): boolean {
  const lower = raw.toLowerCase()
  return TECHNICAL_MARKERS.some((m) => lower.includes(m))
}

function hashPick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

/** Maps any raw pipeline/backend string to safe premium copy for the UI. */
export function sanitizeVideoUiMessage(
  raw: string | undefined | null,
  context: 'crafting' | 'rendering' | 'retry' = 'rendering',
  seed = 0,
): string {
  if (!raw?.trim()) {
    return hashPick(PREMIUM_PIPELINE_MESSAGES[context], seed)
  }
  if (isTechnicalMessage(raw)) {
    return hashPick(
      context === 'retry' ? PREMIUM_PIPELINE_MESSAGES.retry : PREMIUM_PIPELINE_MESSAGES[context],
      seed,
    )
  }
  // Allow curated non-technical messages from our own pipeline
  const allowed = [
    ...PREMIUM_PIPELINE_MESSAGES.crafting,
    ...PREMIUM_PIPELINE_MESSAGES.rendering,
    ...PREMIUM_PIPELINE_MESSAGES.retry,
    PREMIUM_PIPELINE_MESSAGES.success,
    'AI Video wird generiert …',
    'Dein cinematic AI Video ist bereit.',
  ]
  if (allowed.some((a) => raw.includes(a.replace('...', '')) || raw === a)) {
    return raw
  }
  // Unknown message — never pass through
  return hashPick(PREMIUM_PIPELINE_MESSAGES[context], seed)
}

export function premiumRetryMessage(attempt: number): string {
  return PREMIUM_PIPELINE_MESSAGES.retry[(attempt - 1) % PREMIUM_PIPELINE_MESSAGES.retry.length]
}

export function premiumRenderingMessage(status: string, seed = 0): string {
  if (status === 'queued') return PREMIUM_PIPELINE_MESSAGES.rendering[0]
  if (status === 'processing') return PREMIUM_PIPELINE_MESSAGES.rendering[3]
  return hashPick(PREMIUM_PIPELINE_MESSAGES.rendering, seed + 1)
}

/** Console-only diagnostic logging — never render this in UI. */
export function logVideoPipelineError(scope: string, error: unknown, extra?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error)
  const payload = {
    scope,
    message,
    ...extra,
    ...(error instanceof Error && import.meta.env.DEV ? { stack: error.stack } : {}),
  }
  console.error('[VideoPipeline]', payload)
}

export function classifyVideoFailure(error: unknown): VideoFailureKind {
  const raw = (error instanceof Error ? error.message : String(error)).toLowerCase()
  if (raw.includes('insufficient') || raw.includes('credit')) return 'credits'
  if (
    raw.includes('auth') ||
    raw.includes('sitzung') ||
    raw.includes('angemeldet') ||
    raw.includes('auth_required')
  ) {
    return 'auth'
  }
  return 'exhausted'
}

export function getPremiumFailure(kind: VideoFailureKind) {
  return PREMIUM_FAILURE[kind]
}
