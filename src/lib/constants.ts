export const APP_NAME = 'NexTrends'

export const SIDEBAR_ITEMS = [
  { id: 'trends', label: 'Virale Trends' },
  { id: 'ad-copy', label: 'AI Ad Copy Generator' },
  { id: 'hook', label: 'Hook Generator' },
  { id: 'seo', label: 'SEO Title Generator' },
  { id: 'analyzer', label: 'Landing Page Analyzer' },
] as const

export type DashboardToolId = (typeof SIDEBAR_ITEMS)[number]['id']

/** @deprecated Use SIDEBAR_ITEMS / DashboardToolId */
export const NAV_TOOLS = SIDEBAR_ITEMS.filter((item) => item.id !== 'trends')

/** @deprecated Use DashboardToolId */
export type NavToolId = DashboardToolId

export const DEFAULT_CREDITS = 20
export const MAX_CREDITS = 20
export const PRO_PRICE_LABEL = '9,99 € / Monat'

export const STRIPE_CHECKOUT_URL =
  'https://buy.stripe.com/test_dRm4gzgrM72bfak8Anfbq0'
