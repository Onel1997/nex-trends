import type { ComponentType, SVGProps } from 'react'
import {
  BoltIcon,
  ChartBarIcon,
  ClapperboardIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrendingUpIcon,
} from '@/components/ui/icons'

export type LandingFeature = {
  id: string
  title: string
  description: string
  benefit: string
  status?: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  featured?: boolean
  premium?: boolean
}

export const HERO_PILLS = [
  'Trend Intelligence',
  'Hook Generator',
  'AI Ad Copy',
  'SEO Generator',
  'AI Video Studio',
] as const

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'trends',
    title: 'Trend Intelligence',
    description:
      'Entdecke explodierende Nischen, virale Hooks und Opportunity Scores — bevor der Markt gesättigt ist.',
    benefit: 'Live Signale',
    status: 'Core OS',
    Icon: TrendingUpIcon,
    featured: true,
  },
  {
    id: 'hook',
    title: 'Hook Generator',
    description:
      'Scroll-stoppende Opener für die ersten 3 Sekunden. Mehr Watchtime, mehr Reichweite.',
    benefit: '+42% Watchtime',
    status: 'Creator Tool',
    Icon: BoltIcon,
  },
  {
    id: 'ad-copy',
    title: 'AI Ad Copy Generator',
    description:
      'Conversion-optimierte Werbetexte in Sekunden — abgestimmt auf Plattform und Zielgruppe.',
    benefit: '3× schneller',
    status: 'Creator Tool',
    Icon: SparklesIcon,
  },
  {
    id: 'seo',
    title: 'SEO Title Generator',
    description:
      'Klickstarke Headlines mit höherer CTR — für Reels, Blogs und Landing Pages.',
    benefit: 'Höhere CTR',
    status: 'Creator Tool',
    Icon: MagnifyingGlassIcon,
  },
  {
    id: 'analyzer',
    title: 'Landing Page Analyzer',
    description:
      'KI-CRO-Audit mit Scores, Stärken und priorisierten Quick Wins für mehr Conversions.',
    benefit: 'Pro Creator',
    status: 'Pro Feature',
    Icon: ChartBarIcon,
  },
  {
    id: 'studio',
    title: 'AI Video Studio',
    description:
      'Virale AI Shorts mit Voiceovers, Captions und Premium Templates — die volle Produktionssuite.',
    benefit: 'Studio Plan',
    status: 'Premium Feature',
    Icon: ClapperboardIcon,
    premium: true,
  },
]

export type WorkflowStep = {
  id: string
  title: string
  description: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  premium?: boolean
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'discover',
    title: 'Trend entdecken',
    description: 'Live Intelligence für TikTok, Instagram & YouTube.',
    Icon: TrendingUpIcon,
  },
  {
    id: 'hook',
    title: 'Hook generieren',
    description: 'Scroll-stoppende Opener in Sekunden.',
    Icon: BoltIcon,
  },
  {
    id: 'ad-copy',
    title: 'Ad Copy erstellen',
    description: 'Headlines, CTAs & Skripte für Paid & Organic.',
    Icon: SparklesIcon,
  },
  {
    id: 'seo',
    title: 'SEO optimieren',
    description: 'CTR-starke Titles & Captions.',
    Icon: MagnifyingGlassIcon,
  },
  {
    id: 'analyzer',
    title: 'Landingpage analysieren',
    description: 'CRO-Scores & Quick Wins mit KI.',
    Icon: ChartBarIcon,
  },
  {
    id: 'studio',
    title: 'AI Video Studio',
    description: 'Shorts, Voiceovers & Captions — Premium.',
    Icon: ClapperboardIcon,
    premium: true,
  },
]

export type LandingPricingTier = {
  id: string
  name: string
  price: string
  suffix: string
  description: string
  features: readonly string[]
  cta: string
  featured?: boolean
  contactOnly?: boolean
}

export const LANDING_PRICING_TIERS: readonly LandingPricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0 €',
    suffix: '/ Monat',
    description: 'Teste das Creator OS — ideal für den Einstieg.',
    features: [
      'Trend Discovery limitiert',
      '10 Credits',
      'Basic Dashboard',
      'Wasserzeichen-Exporte',
    ],
    cta: 'Kostenlos starten',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '19 €',
    suffix: '/ Monat',
    description: 'Für wachsende Creator und Side Projects.',
    features: [
      'Hook Generator',
      'SEO Generator',
      'AI Ad Copy',
      'Gespeicherte Trends',
      'Mehr Credits',
    ],
    cta: 'Creator starten',
  },
  {
    id: 'pro-creator',
    name: 'Pro Creator',
    price: '49 €',
    suffix: '/ Monat',
    description: 'Die komplette Creator Growth Suite.',
    features: [
      'Alles aus Creator',
      'Volle Trend Intelligence',
      'Landing Page Analyzer',
      'Priorisierte Generation',
      'Erweiterte Analytics',
    ],
    cta: 'Pro Creator wählen',
    featured: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '99 €',
    suffix: '/ Monat',
    description: 'Volle KI-Produktionssuite für Brands.',
    features: [
      'AI Video Studio',
      'Voiceovers & Captions',
      'Premium Templates',
      'Schnellere Render Pipeline',
      'Team Workspace',
    ],
    cta: 'Auf Studio upgraden',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '199 €',
    suffix: '+ / Monat',
    description: 'Skaliere Kundenlieferung mit White-Label.',
    features: [
      'White Label',
      'Team Workspaces',
      'API Access',
      'Client Management',
      'Priorisierte Infrastruktur',
    ],
    cta: 'Vertrieb kontaktieren',
    contactOnly: true,
  },
]

export const HERO_STATS = [
  { value: '500+', label: 'Aktive Creator' },
  { value: '3×', label: 'Schnellerer Workflow' },
  { value: '90s', label: 'Idee → TikTok Script' },
] as const

export const TRUST_BADGES = [
  'Keine Kreditkarte',
  'In 30 Sek. startklar',
  'DSGVO-konform',
  'Jederzeit kündbar',
] as const

export const SOCIAL_STATS = [
  { value: '+42%', label: 'Watchtime' },
  { value: '3×', label: 'Schnellerer Content' },
  { value: '90s', label: 'Idee → Script' },
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
      'Von der Trend-Idee zum TikTok-Script in 90 Sekunden. Unser Content-Team produziert jetzt 3× schneller — ohne Qualitätsverlust.',
    author: 'Sarah Klein',
    role: 'Head of Social · D2C Brand',
    metric: '3× schnellerer Workflow',
    initials: 'SK',
  },
  {
    id: '2',
    quote:
      'Der Hook Generator allein hat unsere Watchtime um 42 % gesteigert. Endlich ein OS, das für Creator gebaut ist — nicht für Marketer.',
    author: 'Marcus Weber',
    role: 'Content Creator · 120K Follower',
    metric: '+42% Watchtime',
    initials: 'MW',
  },
  {
    id: '3',
    quote:
      'Als Agentur liefern wir jetzt 8 Client-Accounts aus einem Workspace. White-Label und API sparen uns Stunden pro Woche.',
    author: 'Lisa Nguyen',
    role: 'Gründerin · Growth Agency',
    metric: '8 Client Workspaces',
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
  title: 'NexTrends — Creator Operating System für virale Inhalte',
  description:
    'Finde Trends, generiere Hooks, optimiere Content und skaliere deine Reichweite — alles in einer KI-Plattform für Creator, Agenturen und Brands.',
  keywords:
    'Creator OS, AI Marketing, Trend Intelligence, Hook Generator, Ad Copy, AI Video Studio, TikTok, Instagram',
} as const
