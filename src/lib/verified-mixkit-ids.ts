import { getAllNicheMixkitIds } from '@/lib/demo-media-niches'

/** Mixkit clip IDs from niche pools (HEAD-validated via scripts/validate-demo-media.mjs). */
export const VERIFIED_MIXKIT_IDS = [...getAllNicheMixkitIds()].sort(
  (a, b) => a - b,
) as readonly number[]

/** Never assign — known 403 or broken */
export const BLOCKED_MIXKIT_IDS = new Set([
  2766, 1361, 1418, 1430, 1605, 1620, 1680, 2324,
  100545, 100541, 100551,
])

export const PLAYABLE_MIXKIT_IDS = VERIFIED_MIXKIT_IDS.filter(
  (id) => !BLOCKED_MIXKIT_IDS.has(id),
)
