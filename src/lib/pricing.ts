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
    name: 'Free',
    tagline: 'Test the creator OS — perfect for side projects.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Limited trend searches',
      '5 AI generations / month',
      'Basic creator tools',
      'Watermarked exports',
    ],
    accent: 'zinc',
    cta: 'Current plan',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'Ship content faster with HD exports and saved trends.',
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: [
      'More AI generations',
      'HD exports — no watermark',
      'Saved trends library',
      'Hook generator',
      'SEO title tools',
    ],
    accent: 'violet',
    cta: 'Start Creator',
  },
  {
    id: 'pro-creator',
    name: 'Pro Creator',
    tagline: 'Unlimited intelligence + full AI Video Studio.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Unlimited trend intelligence',
      'AI Video Studio access',
      'Voiceovers & captions',
      'Premium templates',
      'Faster AI generation',
      'Priority queue',
    ],
    accent: 'fuchsia',
    badge: 'Most Popular',
    featured: true,
    cta: 'Go Pro Creator',
  },
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'Team workspace for brands scaling multiple channels.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Team workspace',
      'Shared assets library',
      'Brand presets',
      'Analytics dashboard',
      'Multiple workspaces',
    ],
    accent: 'emerald',
    cta: 'Upgrade to Studio',
  },
  {
    id: 'agency',
    name: 'Agency',
    tagline: 'Client delivery at scale — white-label & API.',
    monthlyPrice: 199,
    yearlyPrice: 159,
    priceFrom: true,
    features: [
      'Client management',
      'White-label exports',
      'API access',
      'Team roles & permissions',
      'Unlimited projects',
      'Priority infrastructure',
    ],
    accent: 'cyan',
    cta: 'Talk to sales',
    contactOnly: true,
  },
  {
    id: 'admin',
    name: 'Admin Access',
    tagline: 'Founder-level internal access — unlimited everything.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Unlimited credits & generations',
      'All premium tools unlocked',
      'Internal system access',
      'Priority infrastructure',
      'Founder dashboard',
    ],
    accent: 'amber',
    badge: 'Internal',
    cta: 'Active',
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
    label: 'Trend searches',
    values: {
      free: 'Limited',
      creator: 'Expanded',
      'pro-creator': 'Unlimited',
      studio: 'Unlimited',
      agency: 'Unlimited',
      admin: 'Unlimited',
    },
  },
  {
    label: 'AI generations',
    values: {
      free: '5 / mo',
      creator: '50 / mo',
      'pro-creator': 'Unlimited',
      studio: 'Unlimited',
      agency: 'Unlimited',
      admin: 'Unlimited',
    },
  },
  {
    label: 'Export quality',
    values: {
      free: 'Watermarked',
      creator: 'HD',
      'pro-creator': '4K ready',
      studio: '4K + brand',
      agency: 'White-label',
      admin: 'Unlimited',
    },
  },
  {
    label: 'AI Video Studio',
    category: 'Studio',
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
    label: 'Voiceovers & captions',
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
    label: 'Hook & SEO tools',
    values: {
      free: 'Basic',
      creator: true,
      'pro-creator': true,
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'Team workspace',
    category: 'Teams',
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
    label: 'Brand presets',
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
    label: 'Analytics',
    values: {
      free: false,
      creator: false,
      'pro-creator': 'Basic',
      studio: true,
      agency: true,
      admin: true,
    },
  },
  {
    label: 'API access',
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
    label: 'White-label exports',
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
    label: 'Priority queue',
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
  { tool: 'Trend search', cost: 1, description: 'Discover viral niches & hashtags' },
  { tool: 'Hook generator', cost: 1, description: 'Scroll-stopping opener for Reels' },
  { tool: 'Ad copy', cost: 1, description: 'Headlines & CTAs for paid ads' },
  { tool: 'SEO titles', cost: 1, description: 'CTR-optimized titles' },
  { tool: 'Landing analyzer', cost: 2, description: 'Full CRO audit with scores' },
  { tool: 'AI video (short)', cost: 5, description: 'Generate a viral AI short' },
  { tool: 'Voiceover', cost: 2, description: 'AI narration for your clip' },
  { tool: 'Captions', cost: 1, description: 'Auto captions & styling' },
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
    return { amount: 'Founder', suffix: 'access' }
  }

  const price =
    period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice

  if (price === null) {
    return { amount: 'Custom', suffix: '' }
  }

  if (price === 0) {
    return { amount: '0 €', suffix: '/ forever' }
  }

  const prefix = plan.priceFrom ? 'from ' : ''
  const suffix = period === 'yearly' ? '/ mo · billed yearly' : '/ month'
  const savings =
    period === 'yearly' && plan.monthlyPrice && plan.yearlyPrice
      ? `Save ${YEARLY_DISCOUNT_PERCENT}%`
      : undefined

  return {
    amount: `${prefix}${price} €`,
    suffix,
    savings,
  }
}

export function planTierFromProfile(
  hasProAccess: boolean,
  isAdmin: boolean,
  saasPlan?: string | null,
): PlanTierId {
  if (isAdmin) return 'admin'
  if (saasPlan === 'creator') return 'creator'
  if (saasPlan === 'studio') return 'studio'
  if (saasPlan === 'agency') return 'agency'
  if (saasPlan === 'pro_creator' || hasProAccess) return 'pro-creator'
  return 'free'
}
