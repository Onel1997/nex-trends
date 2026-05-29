/** AI Ad Copy Generator types */

export type AdCopyTone =
  | 'aggressive'
  | 'luxury'
  | 'storytelling'
  | 'faceless'
  | 'ugc'

export type AdCopyPlatform =
  | 'Meta Ads'
  | 'TikTok Ads'
  | 'Instagram Ads'
  | 'Google Ads'
  | 'LinkedIn Ads'
  | 'Universal'

export type AdCopyVariant = {
  headline: string
  primaryText: string
  cta: string
}

export type AdCopyVariantWithId = AdCopyVariant & {
  id: string
  character_count: number
  is_saved: boolean
}

export type AdCopyGenerationRequest = {
  briefing: string
  tone: AdCopyTone
  platform: AdCopyPlatform
}

/** Single DB row (one ad variant). */
export type GeneratedAdCopyRow = {
  id: string
  user_id?: string
  generation_batch_id: string
  briefing: string
  tone: string
  platform: string
  headline: string
  primary_text: string
  cta: string
  character_count: number
  is_saved: boolean
  created_at: string
}

/** Grouped generation batch for history / results meta. */
export type AdCopyGenerationBatch = {
  id: string
  briefing: string
  tone: string
  platform: string
  created_at: string
  variants: AdCopyVariantWithId[]
}

export type AdCopyGenerationResult = {
  variants: AdCopyVariantWithId[]
  generation: AdCopyGenerationBatch
}

/** Saved tab row — same flat DB shape. */
export type SavedAdCopyRow = GeneratedAdCopyRow

export const AD_COPY_ROW_SELECT =
  'id, user_id, generation_batch_id, briefing, tone, platform, headline, primary_text, cta, character_count, is_saved, created_at'

export const AD_COPY_PLATFORM_OPTIONS: { value: AdCopyPlatform; label: string }[] = [
  { value: 'Meta Ads', label: 'Meta Ads' },
  { value: 'TikTok Ads', label: 'TikTok Ads' },
  { value: 'Instagram Ads', label: 'Instagram Ads' },
  { value: 'Google Ads', label: 'Google Ads' },
  { value: 'LinkedIn Ads', label: 'LinkedIn Ads' },
  { value: 'Universal', label: 'Universal' },
]

export const AD_COPY_TONE_OPTIONS: { value: AdCopyTone; label: string; desc: string }[] = [
  { value: 'aggressive', label: 'Aggressiv', desc: 'Direkt & conversion-stark' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium & aspirational' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Narrativ & emotional' },
  { value: 'faceless', label: 'Faceless', desc: 'Skalierbar ohne Gesicht' },
  { value: 'ugc', label: 'UGC', desc: 'Authentisch & raw' },
]

export const AD_COPY_GENERATION_COST = 3

export const AD_COPY_VARIANT_COUNT = 5
