/**
 * Reusable AI generation flow for NexTrends tools.
 * Pattern: check credits → consume → call edge function → refresh usage.
 */
import { consumeCredits } from '@/lib/credits/consume'
import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import type { UsageActionId } from '@/lib/plans'
import type { CreditConsumeResult } from '@/types/credits'

export type AiEdgeGenerationOptions<TBody extends Record<string, unknown>, TResult> = {
  feature: UsageActionId
  edgeFunction: string
  edgeBody: TBody
  tool: string
  label: string
  niche?: string
  platform?: string
  prompt?: string
  skipCreditCharge?: boolean
  idempotencyKey?: string
  parseResult: (payload: unknown) => TResult
}

export type AiGenerationFlowResult<TResult> = {
  result: TResult
  credits: CreditConsumeResult | null
}

export async function runAiEdgeGeneration<
  TBody extends Record<string, unknown>,
  TResult,
>(
  options: AiEdgeGenerationOptions<TBody, TResult>,
): Promise<AiGenerationFlowResult<TResult>> {
  let credits: CreditConsumeResult | null = null

  if (!options.skipCreditCharge) {
    credits = await consumeCredits(options.feature, {
      tool: options.tool,
      label: options.label,
      niche: options.niche,
      platform: options.platform,
      prompt: options.prompt ?? options.label,
      generation_type: 'text',
      idempotency_key: options.idempotencyKey,
    })

    if (!credits.allowed) {
      throw Object.assign(new Error(credits.error ?? 'Nicht genug Credits.'), {
        code: 'insufficient_credits',
      })
    }
  }

  const payload = await invokeEdgeFunction<unknown>(options.edgeFunction, options.edgeBody)
  const result = options.parseResult(payload)

  return { result, credits }
}
