export const APP_NAME = 'NexTrends'

export const SIDEBAR_ITEMS = [
  { id: 'trends', label: 'Dashboard' },
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

export const SIGNUP_CREDITS = 10
export const WEEKLY_REFILL_CREDITS = 5
export const MAX_FREE_CREDITS = 15
/** @deprecated Use SIGNUP_CREDITS */
export const FREE_CREDITS = SIGNUP_CREDITS
/** @deprecated Use MAX_FREE_CREDITS */
export const FREE_MONTHLY_AI_LIMIT = MAX_FREE_CREDITS
export const DEFAULT_CREDITS = SIGNUP_CREDITS
export const MAX_CREDITS = MAX_FREE_CREDITS
export const PRO_PRICE_LABEL = '9,99 € / Monat'

export const STRIPE_CHECKOUT_URL =
  'https://buy.stripe.com/test_dRm4gzgrM72Bfak8Anfbq00'
