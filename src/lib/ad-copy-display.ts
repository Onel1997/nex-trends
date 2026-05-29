import {
  AD_COPY_PLATFORM_OPTIONS,
  AD_COPY_TONE_OPTIONS,
  type AdCopyVariant,
} from '@/types/ad-copy-generation'

export const AD_HEADLINE_LIMIT = 60
export const AD_HEADLINE_OPTIMAL = 40
export const AD_PRIMARY_LIMIT = 250
export const AD_PRIMARY_OPTIMAL = 125
export const AD_CTA_LIMIT = 30

export type AdCharState = 'optimal' | 'warning' | 'over'

export function getAdCharState(length: number, optimal: number, limit: number): AdCharState {
  if (length <= optimal) return 'optimal'
  if (length <= limit) return 'warning'
  return 'over'
}

export function getAdCharCountClass(state: AdCharState): string {
  switch (state) {
    case 'optimal':
      return 'text-emerald-400/85'
    case 'warning':
      return 'text-amber-400/85'
    case 'over':
      return 'text-red-400/85'
  }
}

export function getAdCopyTotalChars(variant: AdCopyVariant): number {
  return variant.headline.length + variant.primaryText.length + variant.cta.length
}

export function getAdCopyVariantKey(variant: AdCopyVariant): string {
  return `${variant.headline.trim()}|||${variant.primaryText.trim()}|||${variant.cta.trim()}`
}

export function formatAdCopyForClipboard(variant: AdCopyVariant): string {
  return [
    `Headline: ${variant.headline}`,
    '',
    variant.primaryText,
    '',
    `CTA: ${variant.cta}`,
  ].join('\n')
}

export function formatAdCopyDate(
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

export function getAdCopyToneLabel(tone: string | null | undefined): string {
  if (!tone) return ''
  const match = AD_COPY_TONE_OPTIONS.find((o) => o.value === tone)
  return match?.label ?? tone
}

export function getAdCopyPlatformLabel(platform: string | null | undefined): string {
  if (!platform) return ''
  const match = AD_COPY_PLATFORM_OPTIONS.find((o) => o.value === platform)
  return match?.label ?? platform
}

export function getCtaLabel(cta: string | null | undefined): string {
  if (!cta) return ''
  const trimmed = cta.trim()
  if (trimmed.length <= 18) return trimmed
  return `${trimmed.slice(0, 15)}…`
}

export function savedRowToVariant(row: {
  headline: string
  primary_text: string
  cta: string
}): AdCopyVariant {
  return {
    headline: row.headline,
    primaryText: row.primary_text,
    cta: row.cta,
  }
}
