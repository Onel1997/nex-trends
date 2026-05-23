import type { ComponentType, SVGProps } from 'react'
import {
  BoltIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@/components/ui/icons'

export type LandingFeature = {
  id: string
  title: string
  description: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'ad-copy',
    title: 'AI Ad Copy Generator',
    description:
      'Werbetexte optimiert für TikTok und Instagram — in Sekunden statt Stunden.',
    Icon: SparklesIcon,
  },
  {
    id: 'hook',
    title: 'Hook Generator',
    description:
      'Scroll-stoppende Hooks für mehr Aufmerksamkeit in den ersten 3 Sekunden.',
    Icon: BoltIcon,
  },
  {
    id: 'seo',
    title: 'SEO Title Generator',
    description:
      'Klickstarke Überschriften für maximale Reichweite und höhere CTR.',
    Icon: MagnifyingGlassIcon,
  },
  {
    id: 'analyzer',
    title: 'Landing Page Analyzer',
    description:
      'KI-gestützte Optimierung für Konversionen und klare Handlungsaufforderungen.',
    Icon: ChartBarIcon,
  },
]

export const FREE_FEATURES = [
  'Maximal 20 Credits pro Monat',
  'Zugriff auf Basis-Tools',
  'Standard-Support',
] as const

export const PRO_FEATURES = [
  'Unbegrenzte Credits',
  'Alle Tools',
  'Priorisierter KI-Zugriff',
] as const
