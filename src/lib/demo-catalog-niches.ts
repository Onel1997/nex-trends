export const DEMO_CATALOG_NICHES = [
  'Productivity',
  'Fitness',
  'Beauty',
  'Side Hustle',
  'Food',
  'Luxury',
  'Motivation',
  'AI',
  'Business',
  'Fashion',
] as const

export type DemoCatalogNiche = (typeof DEMO_CATALOG_NICHES)[number]
