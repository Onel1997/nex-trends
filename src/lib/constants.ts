export const APP_NAME = 'NexTrends'

export const NAV_TOOLS = [
  { id: 'ad-copy', label: 'AI Ad Copy Generator' },
  { id: 'seo-title', label: 'SEO Title Generator' },
  { id: 'hook', label: 'Hook Generator' },
  { id: 'landing-analyzer', label: 'Landing Page Analyzer' },
] as const

export type NavToolId = (typeof NAV_TOOLS)[number]['id']

export const DEFAULT_CREDITS = 12
export const MAX_CREDITS = 50
export const PRO_PRICE_LABEL = '9,99 € / Monat'
