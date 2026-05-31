import { formatAuthError } from '@/lib/auth'
import type { AuthError } from '@supabase/supabase-js'

export type NexErrorCode =
  | 'network'
  | 'auth'
  | 'supabase'
  | 'api'
  | 'credits'
  | 'rate_limit'
  | 'validation'
  | 'unknown'

export type NormalizedError = {
  code: NexErrorCode
  title: string
  message: string
  retryable: boolean
}

const NETWORK_PATTERNS = [
  'failed to fetch',
  'load failed',
  'networkerror',
  'network request failed',
  'nicht erreichbar',
  'offline',
]

const AUTH_PATTERNS = [
  'nicht authentifiziert',
  'sitzung abgelaufen',
  'jwt',
  'invalid login',
  'session',
]

const CREDIT_PATTERNS = ['insufficient_credits', 'nicht genug credits', 'keine credits']

const RATE_LIMIT_PATTERNS = ['rate limit', 'too many requests', '429']

function coerceMessage(error: unknown): string {
  if (typeof error === 'string') return error.trim()
  if (error instanceof Error) return error.message.trim()
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>
    if (typeof record.message === 'string') return record.message.trim()
    if (typeof record.error === 'string') return record.error.trim()
    if (typeof record.error_description === 'string') return record.error_description.trim()
  }
  return 'Ein unerwarteter Fehler ist aufgetreten.'
}

function matchesAny(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase()
  return patterns.some((p) => lower.includes(p))
}

function isSupabaseAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as AuthError).name === 'AuthApiError'
  )
}

function isAiShape(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    typeof (error as { message: unknown }).message === 'string'
  )
}

function titleForCode(code: NexErrorCode): string {
  switch (code) {
    case 'network':
      return 'Verbindungsproblem'
    case 'auth':
      return 'Anmeldung erforderlich'
    case 'credits':
      return 'Credits aufgebraucht'
    case 'rate_limit':
      return 'Zu viele Anfragen'
    case 'validation':
      return 'Eingabe ungültig'
    case 'api':
      return 'KI-Dienst nicht verfügbar'
    case 'supabase':
      return 'Daten konnten nicht geladen werden'
    default:
      return 'Etwas ist schiefgelaufen'
  }
}

export function normalizeError(error: unknown): NormalizedError {
  if (isSupabaseAuthError(error)) {
    const message = formatAuthError(error)
    return {
      code: 'auth',
      title: titleForCode('auth'),
      message,
      retryable: false,
    }
  }

  if (isAiShape(error)) {
    const code = error.code as NexErrorCode | string
    const mapped: NexErrorCode =
      code === 'insufficient_credits'
        ? 'credits'
        : code === 'rate_limit'
          ? 'rate_limit'
          : code === 'auth'
            ? 'auth'
            : code === 'validation'
              ? 'validation'
              : code === 'provider'
                ? 'api'
                : 'unknown'

    return {
      code: mapped,
      title: titleForCode(mapped),
      message: error.message,
      retryable: mapped === 'api' || mapped === 'rate_limit',
    }
  }

  const message = coerceMessage(error)
  const lower = message.toLowerCase()

  if (matchesAny(lower, NETWORK_PATTERNS)) {
    return {
      code: 'network',
      title: titleForCode('network'),
      message: 'Bitte prüfe deine Internetverbindung und versuche es erneut.',
      retryable: true,
    }
  }

  if (matchesAny(lower, AUTH_PATTERNS)) {
    return {
      code: 'auth',
      title: titleForCode('auth'),
      message,
      retryable: false,
    }
  }

  if (matchesAny(lower, CREDIT_PATTERNS)) {
    return {
      code: 'credits',
      title: titleForCode('credits'),
      message,
      retryable: false,
    }
  }

  if (matchesAny(lower, RATE_LIMIT_PATTERNS)) {
    return {
      code: 'rate_limit',
      title: titleForCode('rate_limit'),
      message: 'Bitte warte einen Moment und versuche es erneut.',
      retryable: true,
    }
  }

  if (lower.includes('openai') || lower.includes('provider') || lower.includes('edge function')) {
    return {
      code: 'api',
      title: titleForCode('api'),
      message,
      retryable: true,
    }
  }

  if (lower.includes('supabase') || lower.includes('postgres') || lower.includes('row level')) {
    return {
      code: 'supabase',
      title: titleForCode('supabase'),
      message,
      retryable: true,
    }
  }

  return {
    code: 'unknown',
    title: titleForCode('unknown'),
    message,
    retryable: true,
  }
}

export function normalizeSupabaseError(error: { message?: string; code?: string } | null): NormalizedError {
  if (!error) {
    return normalizeError('Unbekannter Datenbankfehler')
  }
  return normalizeError(error.message ?? error.code ?? error)
}
