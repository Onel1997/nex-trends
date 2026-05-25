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
} from '@/components/ui/icons'

export type DashboardRouteId =
  | 'dashboard'
  | 'trend-intelligence'
  | 'saved-trends'
  | 'hook'
  | 'ad-copy'
  | 'seo'
  | 'analyzer'
  | 'settings'

/** Canonical navigation order — sidebar, mobile drawer, dashboard */
export const NAV_ROUTE_ORDER = [
  'dashboard',
  'trend-intelligence',
  'hook',
  'ad-copy',
  'seo',
  'analyzer',
  'saved-trends',
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
    isCoreFeature: true,
  },
  'saved-trends': {
    path: `${DASHBOARD_BASE}/saved-trends`,
    label: 'Saved Trends',
    description: 'Deine gespeicherte Trend-Bibliothek',
    Icon: BookmarkIcon,
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

/** Sidebar + mobile drawer — exact NAV_ROUTE_ORDER */
export function getSidebarRoutes(): DashboardRouteConfig[] {
  return NAV_ROUTE_ORDER.map((id) => getRouteConfig(id)).filter((r) => r.showInSidebar)
}

/** Quick actions: all features except dashboard & settings */
export function getQuickActionRoutes(): DashboardRouteConfig[] {
  return NAV_ROUTE_ORDER.map((id) => getRouteConfig(id)).filter(
    (r) => r.id !== 'dashboard' && r.id !== 'settings' && r.showOnDashboard,
  )
}

/** AI Marketing Tools block — hook → ad-copy → seo → analyzer */
export function getMarketingToolRoutes(): DashboardRouteConfig[] {
  return (['hook', 'ad-copy', 'seo', 'analyzer'] as const).map((id) => getRouteConfig(id))
}

/** @deprecated Use getMarketingToolRoutes */
export function getDashboardMarketingTools(): DashboardRouteConfig[] {
  return getMarketingToolRoutes()
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
