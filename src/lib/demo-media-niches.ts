import {
  DEMO_CATALOG_NICHES,
  type DemoCatalogNiche,
} from '@/lib/demo-catalog-niches'

/**
 * Mixkit IDs curated per niche (HEAD-validated). Visual themes match Trend Intelligence categories.
 * @see scripts/validate-demo-media.mjs
 */
export const NICHE_MIXKIT_IDS: Record<DemoCatalogNiche, readonly number[]> = {
  Fitness: [
    52317, 52089, 52079, 52088, 52091, 52316, 52094, 52099, 52102, 52111, 52112, 52106,
    52108, 52110, 52118, 52104, 1318, 608, 40248, 40758, 780, 40766, 2277, 2280, 2448,
  ],
  Fashion: [
    52270, 52280, 47779, 47770,
    44541, 44554, 44560, 44545, 44550, 44551,
    50641, 23327, 42298, 39874, 39881, 4059,
  ],
  Productivity: [
    1781, 308, 1730, 242, 914, 918, 4531, 41171, 41183, 42664, 42656, 4957, 4907, 4809,
    1000, 1011, 3041, 3125,
  ],
  Beauty: [
    367, 382, 4058, 52046, 52044, 52055, 52057, 39910, 40548, 42723, 40540, 52039, 52033,
    4257, 40556,
  ],
  Food: [
    43925, 43063, 42909, 42910, 42908, 3806, 1666, 1669, 42464, 12171, 43905, 42474, 43922,
    26085, 4672,
  ],
  AI: [
    9757, 41643, 22760, 1728, 46635, 41640, 41642, 41656, 41654, 12748, 41646, 41655, 1726,
    50812, 41639,
  ],
  Business: [
    308, 4809, 42648, 42664, 914, 918, 4547, 3653, 47005, 4832, 41541, 231, 4839, 3508,
  ],
  Luxury: [
    74, 64, 71, 75, 72, 3649, 4280, 18303, 47192, 35230, 44500, 49419, 2889, 4176, 40774,
  ],
  Motivation: [
    46652, 33130, 12983, 9024, 8987, 5997, 46653, 46656, 8796, 23345, 33778, 6616, 2523,
  ],
  'Side Hustle': [
    16262, 21254, 5754, 5816, 6163, 41176, 1730, 4957, 4916, 4531, 41171, 41183, 42653,
    4801, 4919, 41638, 44548,
  ],
}

/** Self-hosted clips pinned to the closest niche theme */
export const LOCAL_MEDIA_BY_NICHE: Partial<Record<DemoCatalogNiche, `/demo-videos/${string}.mp4`>> = {
  Productivity: '/demo-videos/demo-1.mp4',
  Business: '/demo-videos/demo-2.mp4',
  Fashion: '/demo-videos/demo-3.mp4',
  Food: '/demo-videos/demo-4.mp4',
}

const NICHE_ALIASES: Record<DemoCatalogNiche, readonly string[]> = {
  Productivity: ['productivity', 'productive', 'morning', 'routine', 'notion', 'focus', 'deep work', 'study'],
  Fitness: ['fitness', 'gym', 'workout', 'training', 'muscle', 'cardio', 'run', 'health', 'sport'],
  Beauty: ['beauty', 'skin', 'makeup', 'skincare', 'grwm', 'hair', 'glow'],
  'Side Hustle': ['side hustle', 'sidehustle', 'passive', 'freelance', 'ugc', 'resell', 'etsy', 'income'],
  Food: ['food', 'recipe', 'cooking', 'meal', 'kitchen', 'bake', 'restaurant', 'eat'],
  Luxury: ['luxury', 'quiet luxury', 'old money', 'aesthetic', 'premium', 'high end'],
  Motivation: ['motivation', 'mindset', 'discipline', 'inspire', 'goals', 'manifest'],
  AI: ['ai', 'chatgpt', 'automation', 'prompt', 'midjourney', 'artificial', 'tech', 'coding'],
  Business: ['business', 'startup', 'founder', 'saas', 'marketing', 'b2b', 'sales', 'office'],
  Fashion: ['fashion', 'style', 'outfit', 'ootd', 'wardrobe', 'thrift', 'haul'],
}

const ALL_NICHE_IDS = new Set(
  DEMO_CATALOG_NICHES.flatMap((niche) => NICHE_MIXKIT_IDS[niche]),
)

export function isDemoCatalogNiche(value: string): value is DemoCatalogNiche {
  return (DEMO_CATALOG_NICHES as readonly string[]).includes(value)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Avoid false positives like "ai" matching inside "productivity". */
export function queryMatchesNicheAlias(query: string, alias: string): boolean {
  const q = query.trim().toLowerCase()
  const a = alias.trim().toLowerCase()
  if (!q || !a) return false
  if (q === a) return true
  if (a.length >= 3 && q.includes(a)) return true
  if (a.length <= 2) {
    const re = new RegExp(`(?:^|[\\s#_-])${escapeRegExp(a)}(?:$|[\\s#_-])`)
    return re.test(q)
  }
  return q.length >= 3 && a.includes(q)
}

function queryMatchesCatalogLabel(query: string, niche: DemoCatalogNiche): boolean {
  const q = query.trim().toLowerCase()
  const label = niche.toLowerCase()
  const slug = label.replace(/\s+/g, '-')
  if (q === label || q === slug) return true
  if (label.length >= 3 && q.includes(label)) return true
  return false
}

/**
 * Map free-text niche / search query to a catalog niche.
 * Returns null when the query does not map to a known category.
 */
export function resolveCatalogNiche(query?: string): DemoCatalogNiche | null {
  const raw = query?.trim()
  if (!raw) return null

  if (isDemoCatalogNiche(raw)) return raw

  const q = raw.toLowerCase()

  for (const catalogNiche of DEMO_CATALOG_NICHES) {
    if (queryMatchesCatalogLabel(q, catalogNiche)) return catalogNiche
  }

  for (const [catalogNiche, aliases] of Object.entries(NICHE_ALIASES) as [
    DemoCatalogNiche,
    readonly string[],
  ][]) {
    if (aliases.some((alias) => queryMatchesNicheAlias(q, alias))) {
      return catalogNiche
    }
  }

  return null
}

/** Map free-text niche / search query to a catalog niche for media assignment */
export function resolveMediaNiche(niche?: string): DemoCatalogNiche {
  return resolveCatalogNiche(niche) ?? 'Productivity'
}

export function mixkitIdBelongsToNiche(id: number, niche: DemoCatalogNiche): boolean {
  return NICHE_MIXKIT_IDS[niche].includes(id)
}

export function isVideoInNichePool(videoUrl: string | undefined, niche: DemoCatalogNiche): boolean {
  if (!videoUrl?.trim()) return false
  const trimmed = videoUrl.trim()
  const local = LOCAL_MEDIA_BY_NICHE[niche]
  if (local && trimmed === local) return true
  const match = trimmed.match(/mixkit\.co\/videos\/(\d+)/)
  if (!match) return false
  return mixkitIdBelongsToNiche(Number(match[1]), niche)
}

export function getAllNicheMixkitIds(): number[] {
  return [...ALL_NICHE_IDS]
}
