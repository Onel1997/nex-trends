import type { ComponentType, SVGProps } from 'react'
import {
  BoltIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'

export type LandingFeature = {
  id: string
  title: string
  description: string
  benefit: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  featured?: boolean
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'trends',
    title: 'Trend-Scouting',
    description:
      'Finde virale Nischen, bevor sie mainstream werden — mit KI-gestützter Recherche für TikTok & Instagram.',
    benefit: 'Erste Mover Advantage',
    Icon: TrendingUpIcon,
    featured: true,
  },
  {
    id: 'ad-copy',
    title: 'AI Ad Copy Generator',
    description:
      'Conversion-optimierte Werbetexte in Sekunden — perfekt abgestimmt auf deine Zielgruppe und Plattform.',
    benefit: '3× schneller produzieren',
    Icon: SparklesIcon,
  },
  {
    id: 'hook',
    title: 'Hook Generator',
    description:
      'Scroll-stoppende Hooks für die ersten 3 Sekunden. Mehr Watchtime, mehr Reichweite, mehr Sales.',
    benefit: '+40% Watchtime',
    Icon: BoltIcon,
  },
  {
    id: 'seo',
    title: 'SEO Title Generator',
    description:
      'Klickstarke Headlines mit höherer CTR — für Blogs, Reels-Captions und Landing Pages.',
    benefit: 'Höhere CTR',
    Icon: MagnifyingGlassIcon,
  },
  {
    id: 'analyzer',
    title: 'Landing Page Analyzer',
    description:
      'KI-CRO-Analyse deiner Landing Page mit konkreten Handlungsempfehlungen für mehr Conversions.',
    benefit: 'Mehr Conversions',
    Icon: ChartBarIcon,
  },
]

export const FREE_FEATURES = [
  '10 Credits pro Monat',
  'Trend-Scouting inklusive',
  'Dashboard & Usage Analytics',
  'Keine Kreditkarte nötig',
] as const

export const PRO_FEATURES = [
  'Unbegrenzte Credits',
  'Alle Premium-Tools freigeschaltet',
  'Priorisierter KI-Zugriff',
  'Trend Analytics & Insights',
  'Jederzeit kündbar',
] as const

export const HERO_STATS = [
  { value: '500+', label: 'Aktive Creator' },
  { value: '2.4×', label: 'Schnellere Produktion' },
  { value: '10M+', label: 'Generierte Wörter' },
] as const

export const TRUST_BADGES = [
  'Keine Kreditkarte',
  'In 30 Sek. startklar',
  'DSGVO-konform',
  'Jederzeit kündbar',
] as const

export const SOCIAL_STATS = [
  { value: '4.9/5', label: 'Creator-Bewertung' },
  { value: '98%', label: 'Weiterempfehlungsrate' },
  { value: '< 2 Min.', label: 'Bis zum ersten Output' },
  { value: '24/7', label: 'KI verfügbar' },
] as const

export type Testimonial = {
  id: string
  quote: string
  author: string
  role: string
  metric: string
  initials: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      'NexTrends hat unsere Content-Pipeline komplett verändert. Was früher 3 Stunden dauerte, erledigen wir jetzt in 20 Minuten.',
    author: 'Sarah Klein',
    role: 'Social Media Managerin',
    metric: '+180% Output',
    initials: 'SK',
  },
  {
    id: '2',
    quote:
      'Der Hook Generator allein hat unsere TikTok-Watchtime verdoppelt. Endlich ein Tool, das wirklich für Creator gebaut ist.',
    author: 'Marcus Weber',
    role: 'Content Creator · 120K Follower',
    metric: '2× Watchtime',
    initials: 'MW',
  },
  {
    id: '3',
    quote:
      'Trend-Scouting hat uns geholfen, drei virale Formate zu finden, bevor sie gesättigt waren. ROI war sofort da.',
    author: 'Lisa Nguyen',
    role: 'Gründerin · D2C Brand',
    metric: '3 virale Hits',
    initials: 'LN',
  },
]

export const LOGO_CLOUD = [
  'TikTok Creators',
  'Instagram Brands',
  'Marketing Teams',
  'E-Commerce',
  'Agencies',
] as const

export const SEO = {
  title: 'NexTrends — AI Marketing Suite für TikTok & Instagram',
  description:
    'Entdecke virale Trends, generiere scroll-stoppende Hooks & Ad Copy mit KI. Die All-in-One Marketing Suite für Creator und Brands — kostenlos starten.',
  keywords:
    'AI Marketing, TikTok Trends, Instagram Content, Ad Copy Generator, Hook Generator, Trend Scouting',
} as const
