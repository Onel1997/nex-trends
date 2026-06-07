import type { DashboardRouteId } from './routes'

/** Primary tabs shown in the mobile bottom navigation bar. */
export type MobileBottomNavTabId =
  | 'dashboard'
  | 'trends'
  | 'hooks'
  | 'videos'
  | 'profile'

export type MobileBottomNavTab = {
  id: MobileBottomNavTabId
  /** Route navigated when the tab is pressed */
  toolId: DashboardRouteId
  label: string
}

export const MOBILE_BOTTOM_NAV_TABS: readonly MobileBottomNavTab[] = [
  { id: 'dashboard', toolId: 'dashboard', label: 'Dashboard' },
  { id: 'trends', toolId: 'trend-intelligence', label: 'Trends' },
  { id: 'hooks', toolId: 'hook', label: 'Hooks' },
  { id: 'videos', toolId: 'my-videos', label: 'Videos' },
  { id: 'profile', toolId: 'settings', label: 'Profile' },
] as const

const TOOL_TO_TAB: Partial<Record<DashboardRouteId, MobileBottomNavTabId>> = {
  dashboard: 'dashboard',
  'trend-intelligence': 'trends',
  'saved-trends': 'trends',
  hook: 'hooks',
  'my-videos': 'videos',
  'ai-studio': 'videos',
  settings: 'profile',
  billing: 'profile',
  pricing: 'profile',
}

export function getMobileBottomNavTabForTool(
  tool: DashboardRouteId,
): MobileBottomNavTabId | null {
  return TOOL_TO_TAB[tool] ?? null
}

export function isMobileBottomNavTool(tool: DashboardRouteId): boolean {
  return getMobileBottomNavTabForTool(tool) != null
}
