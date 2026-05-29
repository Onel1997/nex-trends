import { getAdCopyTotalChars } from '@/lib/ad-copy-display'
import type {
  AdCopyGenerationBatch,
  AdCopyVariant,
  AdCopyVariantWithId,
  GeneratedAdCopyRow,
} from '@/types/ad-copy-generation'

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return String(err ?? '')
}

export function computeAdCopyCharacterCount(variant: AdCopyVariant): number {
  return getAdCopyTotalChars(variant)
}

export function rowToVariantWithId(row: GeneratedAdCopyRow): AdCopyVariantWithId {
  return {
    id: row.id,
    headline: row.headline,
    primaryText: row.primary_text,
    cta: row.cta,
    character_count: row.character_count,
    is_saved: row.is_saved,
  }
}

export function rowToVariant(row: Pick<GeneratedAdCopyRow, 'headline' | 'primary_text' | 'cta'>): AdCopyVariant {
  return {
    headline: row.headline,
    primaryText: row.primary_text,
    cta: row.cta,
  }
}

export function groupRowsIntoBatches(rows: GeneratedAdCopyRow[]): AdCopyGenerationBatch[] {
  const byBatch = new Map<string, GeneratedAdCopyRow[]>()

  for (const row of rows) {
    const batchId = row.generation_batch_id || row.id
    const list = byBatch.get(batchId) ?? []
    list.push(row)
    byBatch.set(batchId, list)
  }

  const batches: AdCopyGenerationBatch[] = []

  for (const [batchId, batchRows] of byBatch) {
    const sorted = [...batchRows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    const first = sorted[0]
    batches.push({
      id: batchId,
      briefing: first.briefing,
      tone: first.tone,
      platform: first.platform,
      created_at: first.created_at,
      variants: sorted.map(rowToVariantWithId),
    })
  }

  return batches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function batchFromRows(rows: GeneratedAdCopyRow[]): AdCopyGenerationBatch | null {
  if (rows.length === 0) return null
  return groupRowsIntoBatches(rows)[0] ?? null
}

export function isAdCopyTableUnavailableError(err: unknown): boolean {
  const message = errorMessage(err).toLowerCase()

  if (
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('relation "public.generated_ad_copy" does not exist') ||
    message.includes('generated_ad_copy') && message.includes('does not exist')
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
  request: { briefing: string; tone: string; platform: string },
  variants: AdCopyVariant[],
) {
  return variants.map((variant) => ({
    user_id: userId,
    generation_batch_id: batchId,
    briefing: request.briefing.trim(),
    tone: request.tone,
    platform: request.platform,
    headline: variant.headline,
    primary_text: variant.primaryText,
    cta: variant.cta,
    character_count: computeAdCopyCharacterCount(variant),
    is_saved: false,
  }))
}

export function normalizeGeneratedAdCopyRow(row: GeneratedAdCopyRow): GeneratedAdCopyRow {
  return {
    ...row,
    character_count:
      row.character_count > 0
        ? row.character_count
        : computeAdCopyCharacterCount(rowToVariant(row)),
  }
}

export function createEphemeralBatch(
  request: { briefing: string; tone: string; platform: string },
  variants: AdCopyVariant[],
): AdCopyGenerationBatch {
  const batchId = `local-${Date.now()}`
  const createdAt = new Date().toISOString()

  return {
    id: batchId,
    briefing: request.briefing.trim(),
    tone: request.tone,
    platform: request.platform,
    created_at: createdAt,
    variants: variants.map((variant, index) => ({
      ...variant,
      id: `local-${batchId}-${index}`,
      character_count: computeAdCopyCharacterCount(variant),
      is_saved: false,
    })),
  }
}

export function createEphemeralResult(
  request: { briefing: string; tone: string; platform: string },
  variants: AdCopyVariant[],
): { variants: AdCopyVariantWithId[]; generation: AdCopyGenerationBatch } {
  const generation = createEphemeralBatch(request, variants)
  return { variants: generation.variants, generation }
}
