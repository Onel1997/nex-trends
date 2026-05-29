import {
  SEO_SEARCH_INTENT_OPTIONS,
  SEO_TITLE_CHAR_IDEAL_MAX,
  SEO_TITLE_CHAR_IDEAL_MIN,
  SEO_TITLE_CHAR_WARN_MAX,
  SEO_TITLE_CHAR_WEAK_MAX,
  SEO_TITLE_PLATFORM_OPTIONS,
  type SeoTitleVariant,
} from '@/types/seo-title-generation'

export type SeoTitleCharState = 'optimal' | 'warning' | 'weak' | 'over'

export function getSeoTitleCharState(length: number): SeoTitleCharState {
  if (length <= SEO_TITLE_CHAR_WEAK_MAX) return 'weak'
  if (length >= SEO_TITLE_CHAR_IDEAL_MIN && length <= SEO_TITLE_CHAR_IDEAL_MAX) return 'optimal'
  if (length <= SEO_TITLE_CHAR_WARN_MAX) return 'warning'
  return 'over'
}

export function getSeoTitleCharCountClass(state: SeoTitleCharState): string {
  switch (state) {
    case 'optimal':
      return 'text-emerald-400/90'
    case 'warning':
      return 'text-amber-400/90'
    case 'weak':
      return 'text-orange-400/85'
    case 'over':
      return 'text-red-400/90'
  }
}

export function getSeoTitleCharLabel(state: SeoTitleCharState): string {
  switch (state) {
    case 'optimal':
      return 'Ideal'
    case 'warning':
      return 'Lang'
    case 'weak':
      return 'Kurz'
    case 'over':
      return 'Zu lang'
  }
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 80) return 'seo-score-badge--high'
  if (score >= 60) return 'seo-score-badge--mid'
  return 'seo-score-badge--low'
}

export function getSeoTitleVariantKey(variant: SeoTitleVariant): string {
  return variant.title.trim().toLowerCase()
}

export function formatSeoTitleForClipboard(variant: SeoTitleVariant): string {
  return variant.title.trim()
}

export function formatSeoTitleDate(
  iso: string,
  style: 'short' | 'long' | 'relative' = 'short',
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  if (style === 'relative') {
    const diffMs = Date.now() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1) return 'Gerade eben'
    if (diffMin < 60) return `Vor ${diffMin} Min.`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `Vor ${diffH} Std.`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `Vor ${diffD} Tag${diffD === 1 ? '' : 'en'}`
  }

  if (style === 'long') {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getSeoPlatformLabel(platform?: string | null): string {
  if (!platform) return ''
  return SEO_TITLE_PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? platform
}

export function getSeoIntentLabel(intent?: string | null): string {
  if (!intent) return ''
  const key = intent.toLowerCase()
  return SEO_SEARCH_INTENT_OPTIONS.find((o) => o.value === key)?.label ?? intent
}

export function savedRowToVariant(
  row: Pick<
    import('@/types/seo-title-generation').GeneratedSeoTitleRow,
    | 'title_text'
    | 'seo_score'
    | 'ctr_score'
    | 'readability_score'
    | 'keyword'
    | 'search_intent'
    | 'id'
    | 'character_count'
    | 'is_saved'
  >,
): import('@/types/seo-title-generation').SeoTitleVariantWithId {
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
