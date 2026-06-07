import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { generateId } from '@/lib/utils'
import { consumeCredits } from '@/lib/credits/consume'
import { supabase } from '@/lib/supabase'
import {
  batchFromRows,
  createEphemeralResult,
  groupRowsIntoBatches,
  isSeoTitleTableUnavailableError,
  normalizeGeneratedSeoTitleRow,
  variantsToInsertRows,
} from '@/lib/seo-title-db'
import {
  coerceErrorMessage,
  isAiGenerationError,
  normalizeSeoTitleHistoryBatches,
  parseSeoTitleGeneratorPayload,
} from '@/lib/ai/parse-seo-title-response'
import { generateSeoTitleVariantsPlaceholder } from '@/lib/ai-tools-placeholder'
import { CREDIT_COSTS } from '@/lib/plans'
import type {
  GeneratedSeoTitleRow,
  SeoTitleGenerationBatch,
  SeoTitleGenerationRequest,
  SeoTitleGenerationResult,
} from '@/types/seo-title-generation'
import { SEO_TITLE_ROW_SELECT } from '@/types/seo-title-generation'

type SeoTitleGeneratorResponse = SeoTitleGenerationResult & {
  error?: string
  retryAfterMs?: number
  rows?: GeneratedSeoTitleRow[]
}

type SeoTitleHistoryResponse = {
  generations?: SeoTitleGenerationBatch[]
  rows?: GeneratedSeoTitleRow[]
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
  if (isSeoTitleTableUnavailableError(err)) {
    return {
      code: 'storage_unavailable' as const,
      message: 'SEO Title Speicher ist noch nicht eingerichtet. Migration ausführen.',
    }
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

async function persistSeoTitlesLocally(
  request: SeoTitleGenerationRequest,
  variants: Awaited<ReturnType<typeof generateSeoTitleVariantsPlaceholder>>,
): Promise<SeoTitleGenerationResult> {
  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user.id) throw new Error('Nicht authentifiziert.')

  const batchId = generateId()
  const insertRows = variantsToInsertRows(session.session.user.id, batchId, request, variants)

  const { data, error } = await supabase
    .from('generated_seo_titles')
    .insert(insertRows)
    .select(SEO_TITLE_ROW_SELECT)

  if (error) {
    if (isSeoTitleTableUnavailableError(error)) {
      return createEphemeralResult(request, variants)
    }
    throw error
  }

  const rows = (data ?? []).map((row) => normalizeGeneratedSeoTitleRow(row as GeneratedSeoTitleRow))
  const generation = batchFromRows(rows)
  if (!generation) return createEphemeralResult(request, variants)
  return { variants: generation.variants, generation }
}

async function generateWithPlaceholderFallback(
  request: SeoTitleGenerationRequest,
): Promise<SeoTitleGenerationResult> {
  const variants = await generateSeoTitleVariantsPlaceholder(request)
  return persistSeoTitlesLocally(request, variants)
}

export async function generateSeoTitlesWithCredits(
  request: SeoTitleGenerationRequest,
  options?: { skipCreditCharge?: boolean; idempotencyKey?: string },
): Promise<SeoTitleGenerationResult> {
  if (!options?.skipCreditCharge) {
    const creditResult = await consumeCredits('seo_title', {
      cost: CREDIT_COSTS.seo_title,
      tool: 'SEO Title Generator',
      label: `SEO: ${request.briefing.slice(0, 40)}`,
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
    const raw = await invokeEdgeFunction<SeoTitleGeneratorResponse>('seo-title-generator', {
      action: 'generate',
      briefing: request.briefing,
      keyword: request.keyword,
      platform: request.platform,
      searchIntent: request.searchIntent,
    })

    const parsed = parseSeoTitleGeneratorPayload(raw)

    if (!parsed.generation) {
      if (parsed.variants.length > 0) {
        return {
          variants: parsed.variants,
          generation: createEphemeralResult(request, parsed.variants).generation,
        }
      }
      throw { code: 'provider', message: 'SEO-Titel generiert, aber Speicherung fehlgeschlagen.' }
    }

    return { variants: parsed.variants, generation: parsed.generation }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    if (isEdgeUnavailableError(err) || isSeoTitleTableUnavailableError(err)) {
      return generateWithPlaceholderFallback(request)
    }
    throw mapEdgeError(err)
  }
}

export async function fetchSeoTitleGenerationHistory(
  limit = 20,
): Promise<SeoTitleGenerationBatch[]> {
  try {
    const result = await invokeEdgeFunction<SeoTitleHistoryResponse>('seo-title-generator', {
      action: 'history',
      limit,
    })
    if (result.error) throw new Error(coerceErrorMessage(result.error))
    return normalizeSeoTitleHistoryBatches(result.generations ?? result.rows ?? [])
  } catch (err) {
    if (isSeoTitleTableUnavailableError(err)) return []
    if (!isEdgeUnavailableError(err)) throw err

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user.id) return []

    const { data, error } = await supabase
      .from('generated_seo_titles')
      .select(SEO_TITLE_ROW_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit * 5)

    if (error) {
      if (isSeoTitleTableUnavailableError(error)) return []
      throw error
    }

    return groupRowsIntoBatches(
      (data ?? []).map((row) => normalizeGeneratedSeoTitleRow(row as GeneratedSeoTitleRow)),
    ).slice(0, limit)
  }
}

export { isAiGenerationError }
