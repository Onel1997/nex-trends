'use client'

import { Clapperboard, LayoutDashboard, TrendingUp, User, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  getMobileBottomNavTabForTool,
  MOBILE_BOTTOM_NAV_TABS,
  type MobileBottomNavTabId,
} from '@/lib/mobile-bottom-nav'
import type { DashboardToolId } from '@/lib'
import { MobileBottomNavItem } from './MobileBottomNavItem'

const TAB_ICONS: Record<MobileBottomNavTabId, LucideIcon> = {
  dashboard: LayoutDashboard,
  trends: TrendingUp,
  hooks: Zap,
  videos: Clapperboard,
  profile: User,
}

type MobileBottomNavProps = {
  activeTool: DashboardToolId
  onSelectTool: (tool: DashboardToolId) => void
}

export function MobileBottomNav({ activeTool, onSelectTool }: MobileBottomNavProps) {
  const activeTab = getMobileBottomNavTabForTool(activeTool)

  const handleTabPress = (toolId: DashboardToolId) => {
    onSelectTool(toolId)
  }

  return (
    <nav
      className="mobile-bottom-nav pointer-events-auto fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Hauptnavigation"
    >
      <div className="mobile-bottom-nav__surface pointer-events-none absolute inset-0" aria-hidden />
      <div className="mobile-bottom-nav__inner relative mx-auto flex max-w-lg items-stretch gap-0.5 px-2 pt-1.5">
        {MOBILE_BOTTOM_NAV_TABS.map((tab) => (
          <MobileBottomNavItem
            key={tab.id}
            label={tab.label}
            icon={TAB_ICONS[tab.id]}
            active={activeTab === tab.id}
            onSelect={() => handleTabPress(tab.toolId)}
          />
        ))}
      </div>
    </nav>
  )
}
