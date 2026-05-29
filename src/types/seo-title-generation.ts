/** SEO Title Generator types */

export type SeoSearchIntent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'navigational'

export type SeoTitlePlatform =
  | 'Google Search'
  | 'YouTube'
  | 'Blog'
  | 'LinkedIn'
  | 'Universal'

export type SeoTitleVariant = {
  title: string
  seoScore: number
  ctrScore: number
  readabilityScore: number
  keyword: string
  searchIntent: string
}

export type SeoTitleVariantWithId = SeoTitleVariant & {
  id: string
  character_count: number
  is_saved: boolean
}

export type SeoTitleGenerationRequest = {
  briefing: string
  keyword?: string
  platform: SeoTitlePlatform
  searchIntent?: SeoSearchIntent
}

export type GeneratedSeoTitleRow = {
  id: string
  user_id?: string
  generation_batch_id: string
  briefing: string
  keyword: string
  platform: string
  search_intent: string
  title_text: string
  seo_score: number
  ctr_score: number
  readability_score: number
  character_count: number
  is_saved: boolean
  created_at: string
}

export type SeoTitleGenerationBatch = {
  id: string
  briefing: string
  keyword: string
  platform: string
  search_intent: string
  created_at: string
  variants: SeoTitleVariantWithId[]
}

export type SeoTitleGenerationResult = {
  variants: SeoTitleVariantWithId[]
  generation: SeoTitleGenerationBatch
}

export type SavedSeoTitleRow = GeneratedSeoTitleRow

export const SEO_TITLE_ROW_SELECT =
  'id, user_id, generation_batch_id, briefing, keyword, platform, search_intent, title_text, seo_score, ctr_score, readability_score, character_count, is_saved, created_at'

export const SEO_TITLE_PLATFORM_OPTIONS: { value: SeoTitlePlatform; label: string }[] = [
  { value: 'Google Search', label: 'Google Search' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Blog', label: 'Blog / CMS' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Universal', label: 'Universal' },
]

export const SEO_SEARCH_INTENT_OPTIONS: {
  value: SeoSearchIntent
  label: string
  desc: string
}[] = [
  { value: 'informational', label: 'Informational', desc: 'Ratgeber, How-to, Wissen' },
  { value: 'commercial', label: 'Commercial', desc: 'Vergleich, Reviews, Best-of' },
  { value: 'transactional', label: 'Transactional', desc: 'Kauf, Angebot, Conversion' },
  { value: 'navigational', label: 'Navigational', desc: 'Brand, Produkt, Login' },
]

export const SEO_TITLE_GENERATION_COST = 2
export const SEO_TITLE_VARIANT_COUNT = 5

export const SEO_TITLE_CHAR_IDEAL_MIN = 45
export const SEO_TITLE_CHAR_IDEAL_MAX = 60
export const SEO_TITLE_CHAR_WEAK_MAX = 34
export const SEO_TITLE_CHAR_WARN_MAX = 70
