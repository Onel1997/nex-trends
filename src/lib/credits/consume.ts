import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import {
  CREDIT_COSTS,
  toolSlugToUsageAction,
  type UsageActionId,
} from '@/lib/plans'
import type { CreditConsumeResult, ConsumeCreditsPayload } from '@/types/credits'

type ConsumeCreditsAction = 'check' | 'consume'

async function invokeConsumeCredits(
  action: ConsumeCreditsAction,
  payload: Record<string, unknown>,
): Promise<CreditConsumeResult> {
  return invokeEdgeFunction<CreditConsumeResult>('consume-credits', {
    action,
    ...payload,
  })
}

/** Server-authoritative balance check (runs monthly reset RPC). */
export async function checkCredits(): Promise<CreditConsumeResult> {
  return invokeConsumeCredits('check', {})
}

/**
 * Atomically deduct credits for a feature. All enforcement happens in Postgres RPC.
 */
export async function consumeCredits(
  feature: UsageActionId | string,
  options?: Omit<ConsumeCreditsPayload, 'feature'>,
): Promise<CreditConsumeResult> {
  const normalized = String(feature).replace(/-/g, '_')
  const cost = options?.cost ?? CREDIT_COSTS[normalized as UsageActionId] ?? undefined

  return invokeConsumeCredits('consume', {
    feature: normalized,
    cost,
    tool: options?.tool ?? normalized,
    label: options?.label,
    niche: options?.niche,
    platform: options?.platform,
    prompt: options?.prompt,
    generation_type: options?.generation_type,
    metadata: options?.metadata,
    idempotency_key: options?.idempotency_key,
    skip_analytics_log: options?.skip_analytics_log,
  })
}

/** Convenience: map dashboard tool slug → feature id → consume */
export async function consumeCreditsForTool(
  toolSlug: string,
  meta?: Omit<ConsumeCreditsPayload, 'feature'>,
): Promise<CreditConsumeResult> {
  const feature = toolSlugToUsageAction(toolSlug)
  return consumeCredits(feature, {
    ...meta,
    tool: meta?.tool ?? toolSlug,
  })
}

export function getFeatureCreditCost(feature: UsageActionId): number {
  return CREDIT_COSTS[feature]
}
