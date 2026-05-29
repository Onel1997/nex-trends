import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { coerceErrorMessage } from '@/lib/ai/parse-hooks-response'
import {
  CREDIT_COSTS,
  toolSlugToUsageAction,
  type UsageActionId,
} from '@/lib/plans'
import type { CreditConsumeResult, ConsumeCreditsPayload } from '@/types/credits'

type ConsumeCreditsAction = 'check' | 'consume'

function parseCreditConsumeResult(payload: unknown): CreditConsumeResult {
  if (typeof payload === 'string') {
    try {
      return parseCreditConsumeResult(JSON.parse(payload) as unknown)
    } catch {
      throw new Error('Ungültige Antwort von consume-credits.')
    }
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Leere Antwort von consume-credits.')
  }

  const body = payload as Record<string, unknown>

  if (typeof body.error === 'string' && !('allowed' in body)) {
    throw new Error(body.error)
  }

  if (typeof body.allowed !== 'boolean') {
    throw new Error(
      coerceErrorMessage(body.error) ||
        'Ungültige consume-credits Antwort (allowed fehlt).',
    )
  }

  return {
    allowed: body.allowed,
    unlimited: body.unlimited === true,
    used: Number(body.used ?? 0),
    remaining:
      body.remaining === null || body.remaining === undefined
        ? null
        : Number(body.remaining),
    limit:
      body.limit === null || body.limit === undefined ? null : Number(body.limit),
    usageResetDate:
      body.usageResetDate != null ? String(body.usageResetDate) : null,
    plan: body.plan != null ? (String(body.plan) as CreditConsumeResult['plan']) : undefined,
    bonusCredits:
      body.bonusCredits != null ? Number(body.bonusCredits) : undefined,
    cost: body.cost != null ? Number(body.cost) : undefined,
    logId: body.logId != null ? String(body.logId) : undefined,
    error: body.error != null ? coerceErrorMessage(body.error) : undefined,
  }
}

async function invokeConsumeCredits(
  action: ConsumeCreditsAction,
  payload: Record<string, unknown>,
): Promise<CreditConsumeResult> {
  const raw = await invokeEdgeFunction<unknown>(
    'consume-credits',
    { action, ...payload },
    { okStatuses: [402] },
  )
  return parseCreditConsumeResult(raw)
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
