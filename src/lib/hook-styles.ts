import type { TrendHookStyle } from '@/lib/openai'

export const HOOK_STYLE_OPTIONS: {
  id: TrendHookStyle
  label: string
  desc: string
}[] = [
  { id: 'aggressive', label: 'Aggressiv', desc: 'Direkt & konfrontativ' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium & aspirational' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narrativ & emotional' },
  { id: 'faceless', label: 'Faceless', desc: 'Voice-over & Text' },
  { id: 'ugc', label: 'UGC', desc: 'Authentisch & raw' },
]
