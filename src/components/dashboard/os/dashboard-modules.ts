import type { ComponentType, SVGProps } from 'react'
import {
  BoltIcon,
  ChartBarIcon,
  ClapperboardIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import { getRouteConfig, type DashboardRouteId } from '@/lib/routes'

/** Quick Actions — action-oriented order; AI Video Studio leads */
export const DASHBOARD_QUICK_ACTION_IDS = [
  'ai-studio',
  'trend-intelligence',
  'hook',
  'analyzer',
  'ad-copy',
  'seo',
] as const satisfies readonly DashboardRouteId[]

/** Core Products — Trend Intelligence first; AI Video Studio is flagship */
export const DASHBOARD_CORE_PRODUCT_IDS = [
  'trend-intelligence',
  'ai-studio',
  'analyzer',
  'hook',
  'ad-copy',
  'seo',
] as const satisfies readonly DashboardRouteId[]

export const DASHBOARD_FLAGSHIP_ROUTE_ID = 'ai-studio' as const

type ModuleIcon = ComponentType<SVGProps<SVGSVGElement>>

export type DashboardQuickActionModule = {
  id: (typeof DASHBOARD_QUICK_ACTION_IDS)[number]
  title: string
  subtitle: string
  icon: ModuleIcon
  gradient: string
  featured: boolean
}

export type DashboardCoreProductModule = {
  id: (typeof DASHBOARD_CORE_PRODUCT_IDS)[number]
  status: string
  statusVariant: 'success' | 'pro' | 'default'
  featured: boolean
  icon: ModuleIcon
}

const QUICK_ACTION_META: Record<
  (typeof DASHBOARD_QUICK_ACTION_IDS)[number],
  Pick<DashboardQuickActionModule, 'subtitle' | 'icon' | 'gradient'>
> = {
  'ai-studio': {
    subtitle: 'Cinematic AI shorts',
    icon: ClapperboardIcon,
    gradient: 'from-violet-600 via-violet-500 to-fuchsia-600',
  },
  'trend-intelligence': {
    subtitle: 'Viral intelligence',
    icon: TrendingUpIcon,
    gradient: 'from-violet-600 to-indigo-600',
  },
  hook: {
    subtitle: 'Scroll-stoppers',
    icon: BoltIcon,
    gradient: 'from-fuchsia-600 to-violet-600',
  },
  analyzer: {
    subtitle: 'CRO insights',
    icon: ChartBarIcon,
    gradient: 'from-indigo-600 to-violet-600',
  },
  'ad-copy': {
    subtitle: 'Headlines & CTAs',
    icon: SparklesIcon,
    gradient: 'from-violet-600 to-fuchsia-600',
  },
  seo: {
    subtitle: 'CTR-optimized titles',
    icon: MagnifyingGlassIcon,
    gradient: 'from-indigo-600 to-fuchsia-600',
  },
}

const CORE_PRODUCT_META: Record<
  (typeof DASHBOARD_CORE_PRODUCT_IDS)[number],
  Pick<DashboardCoreProductModule, 'status' | 'statusVariant' | 'featured' | 'icon'>
> = {
  'trend-intelligence': {
    status: 'Live',
    statusVariant: 'success',
    featured: false,
    icon: TrendingUpIcon,
  },
  'ai-studio': {
    status: 'Flagship',
    statusVariant: 'pro',
    featured: true,
    icon: ClapperboardIcon,
  },
  analyzer: {
    status: 'Beta',
    statusVariant: 'default',
    featured: false,
    icon: ChartBarIcon,
  },
  hook: {
    status: 'Live',
    statusVariant: 'success',
    featured: false,
    icon: BoltIcon,
  },
  'ad-copy': {
    status: 'Live',
    statusVariant: 'success',
    featured: false,
    icon: SparklesIcon,
  },
  seo: {
    status: 'Live',
    statusVariant: 'success',
    featured: false,
    icon: MagnifyingGlassIcon,
  },
}

export function getDashboardQuickActions(): DashboardQuickActionModule[] {
  return DASHBOARD_QUICK_ACTION_IDS.map((id) => {
    const route = getRouteConfig(id)
    const meta = QUICK_ACTION_META[id]
    return {
      id,
      title: route.label,
      subtitle: meta.subtitle,
      icon: meta.icon,
      gradient: meta.gradient,
      featured: id === DASHBOARD_FLAGSHIP_ROUTE_ID,
    }
  })
}

export function getDashboardCoreProducts(): DashboardCoreProductModule[] {
  return DASHBOARD_CORE_PRODUCT_IDS.map((id) => ({
    id,
    ...CORE_PRODUCT_META[id],
  }))
}
