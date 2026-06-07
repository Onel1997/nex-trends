export type TrendStatusV2 = 'early' | 'exploding' | 'saturated' | 'declining'

export type TrendCategoryV2 =
  | 'ai'
  | 'business'
  | 'fitness'
  | 'beauty'
  | 'ecommerce'
  | 'finance'
  | 'gaming'
  | 'lifestyle'

export type OpportunityTierV2 = 'dead' | 'average' | 'good' | 'strong' | 'viral'

export type TrendV2Signals = {
  status: TrendStatusV2
  category: TrendCategoryV2
  trendScore: number
  opportunityScore: number
  opportunityTier: OpportunityTierV2
  growthPercent: number
  engagementScore: number
  competitionScore: number
  monetizationScore: number
}

export const TREND_CATEGORY_V2_LABELS: Record<TrendCategoryV2, string> = {
  ai: 'AI',
  business: 'Business',
  fitness: 'Fitness',
  beauty: 'Beauty',
  ecommerce: 'E-Commerce',
  finance: 'Finance',
  gaming: 'Gaming',
  lifestyle: 'Lifestyle',
}

export const TREND_CATEGORIES_V2: TrendCategoryV2[] = [
  'ai',
  'business',
  'fitness',
  'beauty',
  'ecommerce',
  'finance',
  'gaming',
  'lifestyle',
]
