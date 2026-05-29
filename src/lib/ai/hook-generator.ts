import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { consumeCredits } from '@/lib/credits/consume'
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
  const message = coerceErrorMessage(err)

  if (message.includes('402') || message.toLowerCase().includes('credit')) {
    return { code: 'insufficient_credits', message: 'Nicht genug Credits für diese Generierung.' }
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
  if (
    message.includes('nicht erreichbar') ||
    message.includes('nicht deployed') ||
    message.toLowerCase().includes('failed to fetch')
  ) {
    return { code: 'unknown', message }
  }

  return { code: 'unknown', message: coerceErrorMessage(message) }
}

/**
 * Production hook generation flow:
 * 1. consume-credits (server-authoritative)
 * 2. hook-generator edge function (OpenAI + persist)
 */
export async function generateHooksWithCredits(
  request: HookGenerationRequest,
  options?: { skipCreditCharge?: boolean; idempotencyKey?: string },
): Promise<HookGenerationResult> {
  if (!options?.skipCreditCharge) {
    const creditResult = await consumeCredits('hook_generation', {
      cost: CREDIT_COSTS.hook_generation,
      tool: 'Hook Generator',
      label: `Hooks: ${request.topic.slice(0, 40)}`,
      niche: request.topic,
      platform: request.platform,
      prompt: request.topic,
      generation_type: 'text',
      idempotency_key: options?.idempotencyKey,
    })

    if (!creditResult.allowed) {
      const err: AiGenerationError = {
        code: 'insufficient_credits',
        message: coerceErrorMessage(creditResult.error ?? 'Nicht genug Credits.'),
      }
      throw err
    }
  }

  try {
    const raw = await invokeEdgeFunction<HookGeneratorResponse>('hook-generator', {
      action: 'generate',
      topic: request.topic,
      tone: request.tone,
      platform: request.platform,
      context: request.context,
      trendTitle: request.trendTitle,
      referenceHook: request.referenceHook,
    })

    const parsed = parseHookGeneratorPayload(raw)

    if (!parsed.generation) {
      throw {
        code: 'provider',
        message: 'Hooks generiert, aber Speicherung fehlgeschlagen.',
      } satisfies AiGenerationError
    }

    return {
      hooks: normalizeHooksList(parsed.hooks),
      generation: normalizeGeneratedHooksRow(parsed.generation),
    }
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

export function isAiGenerationError(err: unknown): err is AiGenerationError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err
  )
}
