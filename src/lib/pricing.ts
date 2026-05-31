export type BillingPeriod = 'monthly' | 'yearly'

export type PlanTierId =
  | 'free'
  | 'creator'
  | 'pro-creator'
  | 'studio'
  | 'agency'
  | 'admin'

export type PlanAccent = 'zinc' | 'violet' | 'fuchsia' | 'emerald' | 'cyan' | 'amber'

export type PricingPlan = {
  id: PlanTierId
  name: string
  tagline: string
  monthlyPrice: number | null
  yearlyPrice: number | null
  priceFrom?: boolean
  features: readonly string[]
  accent: PlanAccent
  badge?: string
  featured?: boolean
  cta: string
  contactOnly?: boolean
  internalOnly?: boolean
}

export const YEARLY_DISCOUNT_PERCENT = 20

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter Creator',
    tagline: 'Teste das NexTrends Creator OS.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Begrenzte Trend Intelligence',
      '5 KI-Generierungen / Monat',
      'Basis-Hooks',
      'Exporte mit Wasserzeichen',
    ],
    accent: 'zinc',
    cta: 'Enthalten',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'Perfekt für wachsende Creator und Side Projects.',
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: [
      'Trend Intelligence',
      'Hook Generator',
      'SEO Generator',
      'KI Ad Copy Generator',
      'Gespeicherte Trends',
      'HD-Exporte',
      'Mehr monatliche Credits',
    ],
    accent: 'violet',
    cta: 'Creator starten',
  },
  {
    id: 'pro-creator',
    name: 'Pro Creator',
    tagline: 'Die komplette Creator Growth Suite.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Unbegrenzte Trend Intelligence',
      'Hook Generator',
      'Landing Page Analyzer',
      'SEO Generator',
      'KI Ad Copy Generator',
      'Virale Frameworks',
      'Erweiterte Analytics',
      'Priorisierte Generierung',
      'Premium Creator Workflows',
    ],
    accent: 'fuchsia',
    badge: 'Beliebteste Wahl',
    featured: true,
    cta: 'Pro Creator freischalten',
  },
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'Volle KI-Produktionssuite für skalierende Creator und Brands.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Volles AI Video Studio',
      'Voiceovers',
      'Untertitel',
      'Premium-Vorlagen',
      'Schnelleres Rendering',
      'Brand Presets',
      'Team-Workspace',
      'Mehrere Workspaces',
    ],
    accent: 'emerald',
    cta: 'Studio aktivieren',
  },
  {
    id: 'agency',
    name: 'Agency',
    tagline: 'Skaliere Kundenlieferung mit White-Label-Infrastruktur.',
    monthlyPrice: 199,
    yearlyPrice: 159,
    priceFrom: true,
    features: [
      'White-Label-Exporte',
      'API-Zugang',
      'Client Workspaces',
      'Team-Rollen',
      'Unbegrenzte Projekte',
      'Priorisierte Infrastruktur',
    ],
    accent: 'cyan',
    cta: 'Agency Demo buchen',
    contactOnly: true,
  },
  {
    id: 'admin',
    name: 'Admin Access',
    tagline: 'Founder-Zugang — unbegrenzt alles.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Unbegrenzte Credits & Generierungen',
      'Alle Premium-Tools freigeschaltet',
      'Interner Systemzugang',
      'Priorisierte Infrastruktur',
      'Founder Dashboard',
    ],
    accent: 'amber',
    badge: 'Intern',
    cta: 'Aktiv',
    internalOnly: true,
  },
] as const

export const PUBLIC_PRICING_PLANS = PRICING_PLANS.filter((p) => !p.internalOnly)

export type ComparisonRow = {
  label: string
  category?: string
  values: Record<PlanTierId, string | boolean>
}

export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  {
    label: 'Trend-Suchen',
    values: {
      free: 'Begrenzt',
      creator: 'Erweitert',
      'pro-creator': 'Unbegrenzt',
      studio: 'Unbegrenzt',
      agency: 'Unbegrenzt',
      admin: 'Unbegrenzt',
    },
  },
  {
    label: 'KI-Generierungen',
    values: {
      free: '5 / Mo.',
      creator: '250 / Mo.',
      'pro-creator': '1.000 / Mo.',
      studio: '5.000 / Mo.',
      agency: 'Unbegrenzt',
      admin: 'Unbegrenzt',
    },
  },
  {
    label: 'Export-Qualität',
    values: {
      free: 'Wasserzeichen',
      creator: 'HD',
      'pro-creator': 'HD + Priority',
      studio: '4K + Brand',
      agency: 'White-Label',
      admin: 'Unbegrenzt',
    },
  },
  {
    label: 'Hook & SEO Tools',
    values: {
      free: 'Basis',
      creator: true,
      'pro-creator': true,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Landing Page Analyzer',
    category: 'Pro Creator',
    values: {
      free: false,
      creator: false,
      'pro-creator': true,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Erweiterte Analytics',
    values: {
      free: false,
      creator: false,
      'pro-creator': true,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'AI Video Studio',
    category: 'Studio',
    values: {
      free: false,
      creator: false,
      'pro-creator': false,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Voiceovers & Untertitel',
    values: {
      free: false,
      creator: false,
      'pro-creator': false,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Team-Workspace',
    values: {
      free: false,
      creator: false,
      'pro-creator': false,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Brand Presets',
    values: {
      free: false,
      creator: false,
      'pro-creator': false,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'API-Zugang',
    category: 'Agency',
    values: {
      free: false,
      creator: false,
      'pro-creator': false,
      studio: false,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'White-Label-Exporte',
    values: {
      free: false,
      creator: false,
      'pro-creator': false,
      studio: false,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Priorisierte Queue',
    values: {
      free: false,
      creator: false,
      'pro-creator': true,
      studio: true,
      agency: true,
      admin: true,
    },
  },
] as const

export const COMPARISON_PLAN_COLUMNS: readonly PlanTierId[] = [
  'free',
  'creator',
  'pro-creator',
  'studio',
  'agency',
]

export type CreditUsageItem = {
  tool: string
  cost: number
  description: string
}

export const CREDIT_USAGE_ITEMS: readonly CreditUsageItem[] = [
  { tool: 'Trend-Suche', cost: 1, description: 'Virale Nischen & Hashtags entdecken' },
  { tool: 'Hook Generator', cost: 2, description: 'Scroll-stoppender Opener für Reels' },
  { tool: 'SEO-Titel', cost: 2, description: 'CTR-optimierte Titel' },
  { tool: 'Ad Copy', cost: 3, description: 'Headlines & CTAs für Paid Ads' },
  { tool: 'Landing Analyzer', cost: 5, description: 'Vollständiges CRO-Audit mit Scores' },
  { tool: 'KI-Video (Short)', cost: 20, description: 'Virales KI-Short generieren' },
  { tool: 'Voiceover', cost: 10, description: 'KI-Sprecher für deinen Clip' },
  { tool: 'Untertitel', cost: 5, description: 'Auto-Untertitel & Styling' },
] as const

export const ENTERPRISE_CONTACT_EMAIL = 'agency@nextrends.ai'

export function getPlanById(id: PlanTierId): PricingPlan {
  return PRICING_PLANS.find((p) => p.id === id) ?? PRICING_PLANS[0]
}

export function formatPlanPrice(
  plan: PricingPlan,
  period: BillingPeriod,
): { amount: string; suffix: string; savings?: string } {
  if (plan.id === 'admin') {
    return { amount: 'Founder', suffix: 'Zugang' }
  }

  const price = period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice

  if (price === null) {
    return { amount: 'Individuell', suffix: '' }
  }

  if (price === 0) {
    return { amount: '0 €', suffix: '/ für immer' }
  }

  const prefix = plan.priceFrom ? 'ab ' : ''
  const suffix = period === 'yearly' ? '/ Mo. · jährlich' : '/ Monat'
  const savings =
    period === 'yearly' && plan.monthlyPrice && plan.yearlyPrice
      ? `${YEARLY_DISCOUNT_PERCENT} % sparen`
      : undefined

  return {
    amount: `${prefix}${price} €`,
    suffix,
    savings,
  }
}

export function planTierFromProfile(
  _hasProAccess: boolean,
  isAdmin: boolean,
  saasPlan?: string | null,
): PlanTierId {
  if (isAdmin) return 'admin'
  const normalized = (saasPlan ?? 'free').trim().toLowerCase().replace(/-/g, '_')
  if (normalized === 'creator') return 'creator'
  if (normalized === 'studio') return 'studio'
  if (normalized === 'agency') return 'agency'
  if (normalized === 'audio') return 'creator'
  if (normalized === 'pro_creator' || normalized === 'pro') return 'pro-creator'
  return 'free'
}

export function planTierRank(tier: PlanTierId): number {
  const ranks: Record<PlanTierId, number> = {
    free: 0,
    creator: 1,
    'pro-creator': 2,
    studio: 3,
    agency: 4,
    admin: 5,
  }
  return ranks[tier] ?? 0
}

export function isBelowFeaturedPlan(currentPlanId: PlanTierId): boolean {
  return planTierRank(currentPlanId) < planTierRank('pro-creator')
}
