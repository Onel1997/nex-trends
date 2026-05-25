import type { ComponentType, SVGProps } from 'react'
import {
  BoltIcon,
  BookmarkIcon,
  ChartBarIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  SettingsIcon,
  SparklesIcon,
  TrendingUpIcon,
  ClapperboardIcon,
  FilmStripIcon,
  CreditCardIcon,
} from '@/components/ui/icons'

export type DashboardRouteId =
  | 'dashboard'
  | 'trend-intelligence'
  | 'saved-trends'
  | 'ai-studio'
  | 'my-videos'
  | 'hook'
  | 'ad-copy'
  | 'seo'
  | 'analyzer'
  | 'pricing'
  | 'billing'
  | 'settings'

/** Canonical navigation order — sidebar, mobile drawer, dashboard */
export const NAV_ROUTE_ORDER = [
  'dashboard',
  'trend-intelligence',
  'ai-studio',
  'my-videos',
  'hook',
  'ad-copy',
  'seo',
  'analyzer',
  'saved-trends',
  'pricing',
  'billing',
  'settings',
] as const satisfies readonly DashboardRouteId[]

export type DashboardRouteConfig = {
  id: DashboardRouteId
  path: string
  label: string
  description: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  showInSidebar: boolean
  showOnDashboard: boolean
  immersive?: boolean
  /** @deprecated Use SIDEBAR_PRO_BADGE_ROUTE — only ai-studio shows PRO in sidebar */
  isCoreFeature?: boolean
  legacyQuery?: string
}

export const DASHBOARD_BASE = '/dashboard'

const ROUTE_DEFINITIONS: Record<DashboardRouteId, Omit<DashboardRouteConfig, 'id'>> = {
  dashboard: {
    path: DASHBOARD_BASE,
    label: 'Dashboard',
    description: 'Übersicht, Credits & Aktivität',
    Icon: HomeIcon,
    showInSidebar: true,
    showOnDashboard: false,
    legacyQuery: 'trends',
  },
  'trend-intelligence': {
    path: `${DASHBOARD_BASE}/trend-intelligence`,
    label: 'Trend Intelligence',
    description: 'Virale Trends, Feed & AI Insights',
    Icon: TrendingUpIcon,
    showInSidebar: true,
    showOnDashboard: true,
    immersive: true,
  },
  'saved-trends': {
    path: `${DASHBOARD_BASE}/saved-trends`,
    label: 'Saved Trends',
    description: 'Deine gespeicherte Trend-Bibliothek',
    Icon: BookmarkIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  'ai-studio': {
    path: '/ai-studio',
    label: 'AI Video Studio',
    description: 'Generate viral AI shorts with hooks, captions and voiceovers',
    Icon: ClapperboardIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  'my-videos': {
    path: '/my-videos',
    label: 'My AI Videos',
    description: 'Deine generierten AI-Videos',
    Icon: FilmStripIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  hook: {
    path: `${DASHBOARD_BASE}/hook-generator`,
    label: 'Hook Generator',
    description: 'Scroll-Stopper für Reels',
    Icon: BoltIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  'ad-copy': {
    path: `${DASHBOARD_BASE}/ad-copy-generator`,
    label: 'AI Ad Copy Generator',
    description: 'Headlines & CTAs für Ads',
    Icon: SparklesIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  seo: {
    path: `${DASHBOARD_BASE}/seo-title-generator`,
    label: 'SEO Title Generator',
    description: 'CTR-optimierte Titel',
    Icon: MagnifyingGlassIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  analyzer: {
    path: `${DASHBOARD_BASE}/landing-page-analyzer`,
    label: 'Landing Page Analyzer',
    description: 'CRO-Audit mit Scores',
    Icon: ChartBarIcon,
    showInSidebar: true,
    showOnDashboard: true,
  },
  pricing: {
    path: `${DASHBOARD_BASE}/pricing`,
    label: 'Pricing',
    description: 'Plans, credits & upgrades',
    Icon: CreditCardIcon,
    showInSidebar: true,
    showOnDashboard: false,
  },
  billing: {
    path: `${DASHBOARD_BASE}/billing`,
    label: 'Billing',
    description: 'Subscription, credits & usage',
    Icon: CreditCardIcon,
    showInSidebar: false,
    showOnDashboard: false,
  },
  settings: {
    path: `${DASHBOARD_BASE}/settings`,
    label: 'Settings',
    description: 'Account & Abo',
    Icon: SettingsIcon,
    showInSidebar: true,
    showOnDashboard: false,
  },
}

export const DASHBOARD_ROUTES: DashboardRouteConfig[] = NAV_ROUTE_ORDER.map((id) => ({
  id,
  ...ROUTE_DEFINITIONS[id],
}))

const ROUTE_BY_ID = new Map(DASHBOARD_ROUTES.map((r) => [r.id, r]))
const ROUTE_BY_PATH = new Map(DASHBOARD_ROUTES.map((r) => [r.path, r]))

export const SIDEBAR_ITEMS = getSidebarRoutes().map(({ id, label }) => ({ id, label }))

export type DashboardToolId = DashboardRouteId

export const DASHBOARD_TOOL_IDS = [...NAV_ROUTE_ORDER]

export function getRouteConfig(id: DashboardRouteId): DashboardRouteConfig {
  return ROUTE_BY_ID.get(id)!
}

export function getPathForTool(id: DashboardRouteId): string {
  return getRouteConfig(id).path
}

/** Flat list of all sidebar routes (legacy) */
export function getSidebarRoutes(): DashboardRouteConfig[] {
  return NAV_ROUTE_ORDER.map((id) => getRouteConfig(id)).filter((r) => r.showInSidebar)
}

/** Core NexTrends modules — Quick Actions & Core Products (in display order) */
export const DASHBOARD_CORE_FEATURES = [
  'trend-intelligence',
  'ai-studio',
  'analyzer',
  'hook',
  'ad-copy',
  'seo',
] as const satisfies readonly DashboardRouteId[]

/** Remaining tools below core module grid on legacy home sections */
export const DASHBOARD_SECONDARY_TOOL_ORDER = [
  'saved-trends',
  'my-videos',
] as const satisfies readonly DashboardRouteId[]

/** Dashboard tool grid — each product surface once, in display order */
export const DASHBOARD_TOOL_GRID_ORDER = [
  ...DASHBOARD_CORE_FEATURES,
  ...DASHBOARD_SECONDARY_TOOL_ORDER,
] as const satisfies readonly DashboardRouteId[]

export function getDashboardToolGridRoutes(): DashboardRouteConfig[] {
  return DASHBOARD_TOOL_GRID_ORDER.map((id) => getRouteConfig(id))
}

export function getDashboardCoreFeatureRoutes(): DashboardRouteConfig[] {
  return DASHBOARD_CORE_FEATURES.map((id) => getRouteConfig(id))
}

/** Secondary tools in the marketing grid (excludes core hero cards) */
export function getMarketingToolRoutes(): DashboardRouteConfig[] {
  return DASHBOARD_SECONDARY_TOOL_ORDER.map((id) => getRouteConfig(id))
}

/** @deprecated Use getDashboardToolGridRoutes */
export function getDashboardMarketingTools(): DashboardRouteConfig[] {
  return getDashboardToolGridRoutes()
}

export function pathToToolId(pathname: string): DashboardRouteId | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized === '/') return 'dashboard'
  const exact = ROUTE_BY_PATH.get(normalized)
  if (exact) return exact.id
  return null
}

export function isImmersiveTool(toolId: DashboardRouteId): boolean {
  return getRouteConfig(toolId).immersive === true
}

export function isValidToolId(value: string): value is DashboardRouteId {
  return ROUTE_BY_ID.has(value as DashboardRouteId)
}
