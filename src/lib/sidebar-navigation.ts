import { AI_CREATOR_TOOL_ORDER, type DashboardRouteId } from '@/lib/routes'

export type SidebarSectionId = 'main' | 'creator' | 'library' | 'system'

export type SidebarDividerAfter = 'default' | 'library'

export type SidebarSection = {
  id: SidebarSectionId
  label: string
  routes: DashboardRouteId[]
  /** Divider style after this section */
  dividerAfter?: SidebarDividerAfter
}

/** Grouped sidebar navigation — order and section labels */
export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'main',
    label: 'Main',
    routes: ['dashboard'],
  },
  {
    id: 'creator',
    label: 'AI Creator',
    routes: [...AI_CREATOR_TOOL_ORDER],
    dividerAfter: 'library',
  },
  {
    id: 'library',
    label: 'Library',
    routes: ['my-videos', 'saved-trends'],
  },
  {
    id: 'system',
    label: 'System',
    routes: ['pricing', 'billing', 'settings'],
  },
]

export const SIDEBAR_LIBRARY_ROUTES: DashboardRouteId[] = ['my-videos', 'saved-trends']
