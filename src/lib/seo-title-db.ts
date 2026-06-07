import type {
  GeneratedSeoTitleRow,
  SeoTitleGenerationBatch,
  SeoTitleGenerationRequest,
  SeoTitleVariant,
  SeoTitleVariantWithId,
} from '@/types/seo-title-generation'

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return String(err ?? '')
}

export function computeSeoTitleCharacterCount(variant: SeoTitleVariant): number {
  return variant.title.length
}

export function rowToVariantWithId(row: GeneratedSeoTitleRow): SeoTitleVariantWithId {
  return {
    id: row.id,
    title: row.title_text,
    seoScore: row.seo_score,
    ctrScore: row.ctr_score,
    readabilityScore: row.readability_score,
    keyword: row.keyword,
    searchIntent: row.search_intent,
    character_count: row.character_count,
    is_saved: row.is_saved,
  }
}

export function groupRowsIntoBatches(rows: GeneratedSeoTitleRow[]): SeoTitleGenerationBatch[] {
  const byBatch = new Map<string, GeneratedSeoTitleRow[]>()

  for (const row of rows) {
    const batchId = row.generation_batch_id || row.id
    const list = byBatch.get(batchId) ?? []
    list.push(row)
    byBatch.set(batchId, list)
  }

  const batches: SeoTitleGenerationBatch[] = []

  for (const [batchId, batchRows] of byBatch) {
    const sorted = [...batchRows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    const first = sorted[0]
    batches.push({
      id: batchId,
      briefing: first.briefing,
      keyword: first.keyword,
      platform: first.platform,
      search_intent: first.search_intent,
      created_at: first.created_at,
      variants: sorted.map(rowToVariantWithId),
    })
  }

  return batches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function batchFromRows(rows: GeneratedSeoTitleRow[]): SeoTitleGenerationBatch | null {
  if (rows.length === 0) return null
  return groupRowsIntoBatches(rows)[0] ?? null
}

export function isSeoTitleTableUnavailableError(err: unknown): boolean {
  const message = errorMessage(err).toLowerCase()

  if (
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('generated_seo_titles') && message.includes('does not exist')
  ) {
    return true
  }

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = String((err as { code: unknown }).code)
    if (code === 'PGRST205' || code === '42P01') return true
  }

  return false
}

export function variantsToInsertRows(
  userId: string,
  batchId: string,
  request: SeoTitleGenerationRequest,
  variants: SeoTitleVariant[],
) {
  const keywordDefault = request.keyword?.trim() || request.briefing.trim().slice(0, 40)

  return variants.map((variant) => ({
    user_id: userId,
    generation_batch_id: batchId,
    briefing: request.briefing.trim(),
    keyword: variant.keyword || keywordDefault,
    platform: request.platform,
    search_intent: variant.searchIntent || request.searchIntent || 'informational',
    title_text: variant.title,
    seo_score: variant.seoScore,
    ctr_score: variant.ctrScore,
    readability_score: variant.readabilityScore,
    character_count: computeSeoTitleCharacterCount(variant),
    is_saved: false,
  }))
}

export function normalizeGeneratedSeoTitleRow(row: GeneratedSeoTitleRow): GeneratedSeoTitleRow {
  return {
    ...row,
    character_count:
      row.character_count > 0 ? row.character_count : row.title_text.length,
  }
}

export function createEphemeralBatch(
  request: SeoTitleGenerationRequest,
  variants: SeoTitleVariant[],
): SeoTitleGenerationBatch {
  const batchId = `local-${Date.now()}`
  const createdAt = new Date().toISOString()
  const keyword = request.keyword?.trim() || request.briefing.trim().slice(0, 40)

  return {
    id: batchId,
    briefing: request.briefing.trim(),
    keyword,
    platform: request.platform,
    search_intent: request.searchIntent || 'informational',
    created_at: createdAt,
    variants: variants.map((variant, index) => ({
      ...variant,
      id: `local-${batchId}-${index}`,
      character_count: computeSeoTitleCharacterCount(variant),
      is_saved: false,
    })),
  }
}

export function createEphemeralResult(
  request: SeoTitleGenerationRequest,
  variants: SeoTitleVariant[],
): { variants: SeoTitleVariantWithId[]; generation: SeoTitleGenerationBatch } {
  const generation = createEphemeralBatch(request, variants)
  return { variants: generation.variants, generation }
}
