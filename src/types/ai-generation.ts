/** Shared AI generation types — reusable across Hook, SEO, Ad Copy, etc. */

export type HookTone =
  | 'aggressive'
  | 'luxury'
  | 'storytelling'
  | 'faceless'
  | 'ugc'

export type HookPlatform =
  | 'TikTok'
  | 'Instagram Reels'
  | 'YouTube Shorts'
  | 'Meta Ads'
  | 'Universal'

export type HookGenerationRequest = {
  topic: string
  tone: HookTone
  platform: HookPlatform
  context?: string
  trendTitle?: string
  referenceHook?: string
}

export type GeneratedHooksRow = {
  id: string
  topic: string
  tone: string
  platform: string
  generated_hooks_json: string[]
  created_at: string
}

export type HookGenerationResult = {
  hooks: string[]
  generation: GeneratedHooksRow
}

export type SavedHookRow = {
  id: string
  generation_id: string | null
  hook_text: string
  topic: string | null
  tone: string | null
  platform: string | null
  saved_at: string
}

export type AiGenerationError = {
  code: 'insufficient_credits' | 'rate_limit' | 'auth' | 'validation' | 'provider' | 'unknown'
  message: string
  retryAfterMs?: number
}

export const HOOK_PLATFORM_OPTIONS: { value: HookPlatform; label: string }[] = [
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Instagram Reels', label: 'Instagram Reels' },
  { value: 'YouTube Shorts', label: 'YouTube Shorts' },
  { value: 'Meta Ads', label: 'Meta Ads' },
  { value: 'Universal', label: 'Universal' },
]

export const HOOK_TONE_OPTIONS: { value: HookTone; label: string; desc: string }[] = [
  { value: 'aggressive', label: 'Aggressiv', desc: 'Direkt & konfrontativ' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium & aspirational' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Narrativ & emotional' },
  { value: 'faceless', label: 'Faceless', desc: 'Voice-over & Text' },
  { value: 'ugc', label: 'UGC', desc: 'Authentisch & raw' },
]

export const HOOK_GENERATION_COST = 2
