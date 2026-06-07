export const APP_NAME = 'NexTrends'

export {
  SIDEBAR_ITEMS,
  DASHBOARD_ROUTES,
  DASHBOARD_BASE,
  isImmersiveTool,
  getRouteConfig,
  getPathForTool,
  getDashboardMarketingTools,
  type DashboardToolId,
  type DashboardRouteId,
} from './routes'

import { SIDEBAR_ITEMS, type DashboardToolId } from './routes'
import { planMonthlyCredits } from '@/lib/plans'

export const SIGNUP_CREDITS = planMonthlyCredits('free') ?? 25
/** Monthly allowance for free tier (same as signup) */
export const MAX_FREE_CREDITS = SIGNUP_CREDITS
/** @deprecated Weekly refill removed — monthly reset via Postgres RPC */
export const WEEKLY_REFILL_CREDITS = 0
/** @deprecated Use SIGNUP_CREDITS */
export const FREE_CREDITS = SIGNUP_CREDITS
/** @deprecated Use MAX_FREE_CREDITS */
export const FREE_MONTHLY_AI_LIMIT = MAX_FREE_CREDITS
export const DEFAULT_CREDITS = SIGNUP_CREDITS
export const MAX_CREDITS = MAX_FREE_CREDITS
export const PRO_PRICE_LABEL = '9,99 € / Monat'

export const STRIPE_CHECKOUT_URL =
  'https://buy.stripe.com/test_dRm4gzgrM72Bfak8Anfbq00'

/** @deprecated Use SIDEBAR_ITEMS */
export const NAV_TOOLS = SIDEBAR_ITEMS.filter((item) => item.id !== 'dashboard')

/** @deprecated */
export type NavToolId = DashboardToolId
