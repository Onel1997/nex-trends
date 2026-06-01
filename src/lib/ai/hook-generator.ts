import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import {
  coerceErrorMessage,
  normalizeGeneratedHooksRow,
  normalizeHooksList,
  parseHookGeneratorPayload,
} from '@/lib/ai/parse-hooks-response'
import { CREDIT_COSTS } from '@/lib/plans'
import type {
  AiGenerationError,
  GeneratedHooksRow,
  HookGenerationRequest,
  HookGenerationResult,
} from '@/types/ai-generation'

type HookGeneratorResponse = HookGenerationResult & { error?: string; retryAfterMs?: number }

type HookHistoryResponse = {
  generations: GeneratedHooksRow[]
  error?: string
}

function mapEdgeError(err: unknown, statusHint?: number): AiGenerationError {
  let message = coerceErrorMessage(err)

  if (message.startsWith('insufficient_credits:')) {
    message = message.replace(/^insufficient_credits:\s*/i, '').trim()
  }

  if (
    statusHint === 402 ||
    message.includes('insufficient_credits') ||
    message.includes('402') ||
    (message.toLowerCase().includes('credit') &&
      message.toLowerCase().includes('nicht genug'))
  ) {
    return {
      code: 'insufficient_credits',
      message: message || 'Nicht genug Credits für diese Generierung.',
    }
  }
  if (statusHint === 429 || message.toLowerCase().includes('warte')) {
    return { code: 'rate_limit', message }
  }
  if (message.includes('401') || message.toLowerCase().includes('authentif')) {
    return { code: 'auth', message: 'Bitte melde dich erneut an.' }
  }
  if (message.toLowerCase().includes('thema') || message.toLowerCase().includes('mindestens')) {
    return { code: 'validation', message }
  }
  if (message.toLowerCase().includes('openai') || message.toLowerCase().includes('api')) {
    return { code: 'provider', message }
  }
  if (message.includes('OPENAI_API_KEY')) {
    return {
      code: 'provider',
      message:
        'OPENAI_API_KEY fehlt auf dem Server. Im Supabase Dashboard unter Edge Functions → Secrets setzen und hook-generator neu deployen.',
    }
  }
  if (message.toLowerCase().includes('speichern fehlgeschlagen')) {
    return { code: 'provider', message }
  }
  if (
    message.includes('nicht erreichbar') ||
    message.includes('nicht deployed') ||
    message.toLowerCase().includes('failed to fetch')
  ) {
    return { code: 'unknown', message }
  }

  if (message === 'EDGE_FUNCTION_ERROR' || message === 'EDGE_FUNCTION_EMPTY') {
    return {
      code: 'unknown',
      message: 'Hook Generator nicht erreichbar. Bitte erneut versuchen.',
    }
  }

  return { code: 'unknown', message }
}

/**
 * Production hook generation flow:
 * hook-generator edge function charges credits server-side, calls OpenAI, persists.
 */
export async function generateHooksWithCredits(
  request: HookGenerationRequest,
  options?: { skipCreditCharge?: boolean; idempotencyKey?: string },
): Promise<HookGenerationResult> {
  try {
    const raw = await invokeEdgeFunction<HookGeneratorResponse>('hook-generator', {
      action: 'generate',
      topic: request.topic,
      tone: request.tone,
      platform: request.platform,
      context: request.context,
      trendTitle: request.trendTitle,
      referenceHook: request.referenceHook,
      skipCreditCharge: options?.skipCreditCharge === true,
      idempotencyKey: options?.idempotencyKey,
      cost: CREDIT_COSTS.hook_generation,
    })

    const parsed = parseHookGeneratorPayload(raw)
    const hooks = normalizeHooksList(parsed.hooks)

    const generation = parsed.generation
      ? normalizeGeneratedHooksRow(parsed.generation)
      : buildEphemeralGenerationRow(request, hooks)

    return { hooks, generation }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      throw err
    }
    throw mapEdgeError(err)
  }
}

export async function fetchHookGenerationHistory(
  limit = 20,
): Promise<GeneratedHooksRow[]> {
  const result = await invokeEdgeFunction<HookHistoryResponse>('hook-generator', {
    action: 'history',
    limit,
  })

  if (result.error) {
    throw new Error(coerceErrorMessage(result.error))
  }

  return (result.generations ?? []).map(normalizeGeneratedHooksRow)
}

function buildEphemeralGenerationRow(
  request: HookGenerationRequest,
  hooks: string[],
): GeneratedHooksRow {
  return {
    id: `ephemeral-${Date.now()}`,
    topic: request.topic,
    tone: request.tone,
    platform: request.platform,
    generated_hooks_json: hooks,
    created_at: new Date().toISOString(),
  }
}

export function isAiGenerationError(err: unknown): err is AiGenerationError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err
  )
}
