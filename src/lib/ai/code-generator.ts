import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { consumeCredits } from '@/lib/credits/consume'
import {
  createEphemeralCodeResult,
  isCodeTableUnavailableError,
  normalizeGeneratedCodeRow,
} from '@/lib/code-db'
import {
  coerceErrorMessage,
  isAiGenerationError,
  normalizeCodeHistory,
  parseCodeGeneratorPayload,
  type AiGenerationError,
} from '@/lib/ai/parse-code-response'
import { CREDIT_COSTS } from '@/lib/plans'
import type {
  CodeGeneration,
  CodeGenerationRequest,
  CodeGenerationResult,
} from '@/types/code-generation'

type CodeGeneratorResponse = CodeGenerationResult & {
  error?: string
  code?: string
  language?: string
}

type CodeHistoryResponse = {
  generations?: CodeGeneration[]
  rows?: unknown[]
  error?: string
}

function mapEdgeError(err: unknown): AiGenerationError {
  const message = coerceErrorMessage(err)

  if (message.includes('402') || message.toLowerCase().includes('credit')) {
    return { code: 'insufficient_credits', message: 'Nicht genug Credits für diese Generierung.' }
  }
  if (message.includes('403') || message.toLowerCase().includes('admin')) {
    return { code: 'auth', message: 'Nur für Admins verfügbar.' }
  }
  if (message.includes('401') || message.toLowerCase().includes('authentif')) {
    return { code: 'auth', message: 'Bitte melde dich erneut an.' }
  }
  if (message.includes('429') || message.toLowerCase().includes('warte')) {
    return { code: 'rate_limit', message }
  }
  if (message.includes('OPENAI_API_KEY')) {
    return {
      code: 'provider',
      message:
        'OPENAI_API_KEY fehlt auf dem Server. Im Supabase Dashboard unter Edge Functions → Secrets setzen.',
    }
  }
  return { code: 'unknown', message }
}

export async function generateCodeWithCredits(
  request: CodeGenerationRequest,
  options?: { skipCreditCharge?: boolean; idempotencyKey?: string },
): Promise<CodeGenerationResult> {
  if (!options?.skipCreditCharge) {
    const creditResult = await consumeCredits('ai_code', {
      cost: CREDIT_COSTS.ai_code,
      tool: 'AI Code Generator',
      label: `Code: ${request.projectDescription.slice(0, 40)}`,
      niche: request.projectDescription,
      platform: request.framework,
      prompt: request.projectDescription,
      generation_type: 'text',
      idempotency_key: options?.idempotencyKey,
    })

    if (!creditResult.allowed) {
      throw {
        code: 'insufficient_credits',
        message: coerceErrorMessage(creditResult.error ?? 'Nicht genug Credits.'),
      }
    }
  }

  try {
    const raw = await invokeEdgeFunction<CodeGeneratorResponse>('code-generator', {
      action: 'generate',
      projectDescription: request.projectDescription,
      framework: request.framework,
      outputType: request.outputType,
    })

    return parseCodeGeneratorPayload(raw)
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    throw mapEdgeError(err)
  }
}

export async function fetchCodeGenerationHistory(limit = 20): Promise<CodeGeneration[]> {
  try {
    const result = await invokeEdgeFunction<CodeHistoryResponse>('code-generator', {
      action: 'history',
      limit,
    })

    if (result.error) throw new Error(coerceErrorMessage(result.error))

    if (Array.isArray(result.generations) && result.generations.length > 0) {
      return result.generations
    }

    return normalizeCodeHistory(result.rows ?? [])
  } catch (err) {
    if (isCodeTableUnavailableError(err)) return []
    throw err
  }
}

export { isAiGenerationError, createEphemeralCodeResult, normalizeGeneratedCodeRow }
