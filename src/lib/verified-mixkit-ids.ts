import { getAllNicheMixkitIds } from '@/lib/demo-media-niches'
import {
  BLOCKED_MIXKIT_IDS,
  QUALITY_BLOCKED_MIXKIT_IDS,
  isBlockedMixkitId,
} from '@/lib/demo-video-quality'

/** Mixkit clip IDs from niche pools (HEAD-validated via scripts/validate-demo-media.mjs). */
export const VERIFIED_MIXKIT_IDS = [...getAllNicheMixkitIds()].sort(
  (a, b) => a - b,
) as readonly number[]

/** Never assign — broken HTTP or failed quality validation */
export { BLOCKED_MIXKIT_IDS, QUALITY_BLOCKED_MIXKIT_IDS, isBlockedMixkitId }

export const PLAYABLE_MIXKIT_IDS = VERIFIED_MIXKIT_IDS.filter((id) => !isBlockedMixkitId(id))
