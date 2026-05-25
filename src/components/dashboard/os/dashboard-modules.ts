import type { ComponentType, SVGProps } from 'react'
import {
  BoltIcon,
  ChartBarIcon,
  ClapperboardIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'
import type { DashboardRouteId } from '@/lib/routes'

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

export type DashboardCoreProductModule = {
  id: (typeof DASHBOARD_CORE_PRODUCT_IDS)[number]
  status: string
  statusVariant: 'success' | 'pro' | 'default'
  featured: boolean
  icon: ModuleIcon
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

export function getDashboardCoreProducts(): DashboardCoreProductModule[] {
  return DASHBOARD_CORE_PRODUCT_IDS.map((id) => ({
    id,
    ...CORE_PRODUCT_META[id],
  }))
}
