import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { generateId } from '@/lib/utils'
import { consumeCredits } from '@/lib/credits/consume'
import { supabase } from '@/lib/supabase'
import {
  batchFromRows,
  createEphemeralResult,
  groupRowsIntoBatches,
  isAdCopyTableUnavailableError,
  normalizeGeneratedAdCopyRow,
  variantsToInsertRows,
} from '@/lib/ad-copy-db'
import {
  coerceErrorMessage,
  normalizeAdCopyHistoryBatches,
  normalizeAdCopyVariants,
  parseAdCopyGeneratorPayload,
} from '@/lib/ai/parse-ad-copy-response'
import { generateAdCopyVariantsPlaceholder } from '@/lib/ai-tools-placeholder'
import { CREDIT_COSTS } from '@/lib/plans'
import type {
  AdCopyGenerationBatch,
  AdCopyGenerationRequest,
  AdCopyGenerationResult,
  GeneratedAdCopyRow,
} from '@/types/ad-copy-generation'
import { AD_COPY_ROW_SELECT } from '@/types/ad-copy-generation'

type AdCopyGeneratorResponse = AdCopyGenerationResult & {
  error?: string
  retryAfterMs?: number
  rows?: GeneratedAdCopyRow[]
}

type AdCopyHistoryResponse = {
  generations?: AdCopyGenerationBatch[]
  rows?: GeneratedAdCopyRow[]
  error?: string
}

function mapEdgeError(err: unknown, statusHint?: number) {
  const message = coerceErrorMessage(err)

  if (message.includes('402') || message.toLowerCase().includes('credit')) {
    return { code: 'insufficient_credits' as const, message: 'Nicht genug Credits für diese Generierung.' }
  }
  if (statusHint === 429 || message.toLowerCase().includes('warte')) {
    return { code: 'rate_limit' as const, message }
  }
  if (message.includes('401') || message.toLowerCase().includes('authentif')) {
    return { code: 'auth' as const, message: 'Bitte melde dich erneut an.' }
  }
  if (message.toLowerCase().includes('briefing') || message.toLowerCase().includes('mindestens')) {
    return { code: 'validation' as const, message }
  }
  if (isAdCopyTableUnavailableError(err)) {
    return { code: 'storage_unavailable' as const, message: 'Ad Copy Speicher ist noch nicht eingerichtet. Migration ausführen.' }
  }
  if (message.toLowerCase().includes('openai') || message.toLowerCase().includes('api')) {
    return { code: 'provider' as const, message }
  }
  if (message.includes('OPENAI_API_KEY')) {
    return {
      code: 'provider' as const,
      message:
        'OPENAI_API_KEY fehlt auf dem Server. Im Supabase Dashboard unter Edge Functions → Secrets setzen und ad-copy-generator neu deployen.',
    }
  }
  if (message.toLowerCase().includes('speichern fehlgeschlagen')) {
    return { code: 'provider' as const, message }
  }

  return { code: 'unknown' as const, message: coerceErrorMessage(message) }
}

function isEdgeUnavailableError(err: unknown): boolean {
  const message = coerceErrorMessage(err).toLowerCase()
  return (
    message.includes('nicht erreichbar') ||
    message.includes('nicht deployed') ||
    message.includes('failed to fetch') ||
    message.includes('network')
  )
}

async function persistAdCopyLocally(
  request: AdCopyGenerationRequest,
  variants: ReturnType<typeof normalizeAdCopyVariants>,
): Promise<AdCopyGenerationResult> {
  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user.id) {
    throw new Error('Nicht authentifiziert.')
  }

  const batchId = generateId()
  const insertRows = variantsToInsertRows(
    session.session.user.id,
    batchId,
    request,
    variants,
  )

  const { data, error } = await supabase
    .from('generated_ad_copy')
    .insert(insertRows)
    .select(AD_COPY_ROW_SELECT)

  if (error) {
    if (isAdCopyTableUnavailableError(error)) {
      return createEphemeralResult(request, variants)
    }
    throw error
  }

  const rows = (data ?? []).map((row) => normalizeGeneratedAdCopyRow(row as GeneratedAdCopyRow))
  const generation = batchFromRows(rows)

  if (!generation) {
    return createEphemeralResult(request, variants)
  }

  return { variants: generation.variants, generation }
}

async function generateWithPlaceholderFallback(
  request: AdCopyGenerationRequest,
): Promise<AdCopyGenerationResult> {
  const variants = await generateAdCopyVariantsPlaceholder(
    request.briefing,
    request.tone,
    request.platform,
  )
  return persistAdCopyLocally(request, variants)
}

export async function generateAdCopyWithCredits(
  request: AdCopyGenerationRequest,
  options?: { skipCreditCharge?: boolean; idempotencyKey?: string },
): Promise<AdCopyGenerationResult> {
  if (!options?.skipCreditCharge) {
    const creditResult = await consumeCredits('ad_copy', {
      cost: CREDIT_COSTS.ad_copy,
      tool: 'AI Ad Copy Generator',
      label: `Ad Copy: ${request.briefing.slice(0, 40)}`,
      niche: request.briefing,
      platform: request.platform,
      prompt: request.briefing,
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
    const raw = await invokeEdgeFunction<AdCopyGeneratorResponse>('ad-copy-generator', {
      action: 'generate',
      briefing: request.briefing,
      tone: request.tone,
      platform: request.platform,
    })

    const parsed = parseAdCopyGeneratorPayload(raw)

    if (!parsed.generation) {
      if (parsed.variants.length > 0) {
        return { variants: parsed.variants, generation: createEphemeralResult(request, parsed.variants).generation }
      }
      throw {
        code: 'provider',
        message: 'Ad Copy generiert, aber Speicherung fehlgeschlagen.',
      }
    }

    return {
      variants: parsed.variants,
      generation: parsed.generation,
    }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      throw err
    }

    if (isEdgeUnavailableError(err) || isAdCopyTableUnavailableError(err)) {
      return generateWithPlaceholderFallback(request)
    }

    throw mapEdgeError(err)
  }
}

export async function fetchAdCopyGenerationHistory(
  limit = 20,
): Promise<AdCopyGenerationBatch[]> {
  try {
    const result = await invokeEdgeFunction<AdCopyHistoryResponse>('ad-copy-generator', {
      action: 'history',
      limit,
    })

    if (result.error) {
      throw new Error(coerceErrorMessage(result.error))
    }

    return normalizeAdCopyHistoryBatches(result.generations ?? result.rows ?? [])
  } catch (err) {
    if (isAdCopyTableUnavailableError(err)) return []
    if (!isEdgeUnavailableError(err)) throw err

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user.id) return []

    const { data, error } = await supabase
      .from('generated_ad_copy')
      .select(AD_COPY_ROW_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit * 5)

    if (error) {
      if (isAdCopyTableUnavailableError(error)) return []
      throw error
    }

    return groupRowsIntoBatches(
      (data ?? []).map((row) => normalizeGeneratedAdCopyRow(row as GeneratedAdCopyRow)),
    ).slice(0, limit)
  }
}

export { isAiGenerationError } from '@/lib/ai/parse-ad-copy-response'
