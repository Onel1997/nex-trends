import { readEnv } from '@/lib/env'
import { mapRawToTrendIntelligence } from '@/lib/trend-intelligence'
import type { ScoutedTrendRaw, TrendIntelligence } from '@/types/trend-intelligence'

const AD_COPY_SYSTEM_PROMPT =
  'Du bist ein Top-Experte für Social Media Marketing, speziell TikTok und Instagram Reels. Schreibe ein kurzes, extrem virales Skript. Strukturiere es in 3 Teile: 1. Hook (Scroll-Stopper), 2. Body (Mehrwert/Problem lösen), 3. CTA (Call to Action). Halte es knackig und modern.'

const HOOK_SYSTEM_PROMPT =
  'Du bist ein Viralitäts-Experte für Kurzvideos (TikTok, Reels, Shorts). Der User nennt dir ein Thema. Schreibe 5 extrem aufmerksamkeitsstarke, psychologisch clevere Hooks (Scroll-Stopper) für die ersten 3 Sekunden eines Videos. Nutze keine Hashtags, sondern fokussiere dich auf starke Aussagen oder Neugierde weckende Fragen.'

const SEO_TITLE_SYSTEM_PROMPT =
  'Du bist ein SEO-Experte und Copywriter. Der User nennt dir ein Keyword oder Thema. Erstelle 5 klickstarke, SEO-optimierte Titel (max. 60 Zeichen) für Blogbeiträge oder Produktseiten, die eine hohe CTR (Click-Through-Rate) garantieren. Mache sie ansprechend für Suchmaschinen und Menschen.'

const LANDING_ANALYZER_SYSTEM_PROMPT =
  'Du bist ein Conversion-Rate-Optimierer (CRO). Der User gibt eine Idee, Zielgruppe oder ein Produkt für eine Landingpage ein. Analysiere das Potenzial und gib 3 konkrete, psychologische Tipps, wie man die Landingpage aufbauen muss, um maximale Verkäufe/Leads zu generieren. Nutze übersichtliche Bulletpoints.'

const TREND_SCOUT_SYSTEM_PROMPT = `Du bist ein Senior Social Media Trend Intelligence Analyst für TikTok und Instagram (DACH-Markt, 2025/2026).

Der User nennt eine Nische. Erstelle 4 datengetriebene Trend-Insights als JSON.

Regeln:
- Realistische, plausible Metriken (keine utopischen Zahlen)
- viralScore: Integer 55–96 (höher = viraleres Potenzial)
- trendVelocity: "rising" | "peak" | "stable" | "cooling"
- hashtags: 3–5 echte, relevante Hashtags mit #
- contentIdeas: 2 konkrete Video-Ideen
- hookSuggestions: 2 Scroll-Stopper-Hooks
- creatorInspiration: 1 Satz mit Posting-Stil / Format (kein @name nötig, eher Schnitt & Hook-Stil)
- engagementPrediction: 1 Satz Prognose für die nächsten 48–72h
- platform: "TikTok" oder "Instagram"
- views: String wie "1.2M" oder "890K"
- engagement: Prozent-String wie "8.5%"

Antworte NUR mit JSON: {"trends":[{...}]}`

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = readEnv('VITE_OPENAI_API_KEY')

  if (!apiKey?.trim()) {
    throw new Error(
      'VITE_OPENAI_API_KEY fehlt. Bitte trage deinen OpenAI API-Key in der .env-Datei ein.',
    )
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  const data = (await response.json()) as ChatCompletionResponse

  if (!response.ok) {
    throw new Error(
      data.error?.message ?? `OpenAI API Fehler (Status ${response.status})`,
    )
  }

  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('Keine Antwort von OpenAI erhalten.')
  }

  return content
}

export function generateAdCopy(briefing: string) {
  return callOpenAI(AD_COPY_SYSTEM_PROMPT, briefing)
}

export function generateHooks(briefing: string) {
  return callOpenAI(HOOK_SYSTEM_PROMPT, briefing)
}

export function generateSeoTitles(briefing: string) {
  return callOpenAI(SEO_TITLE_SYSTEM_PROMPT, briefing)
}

export function analyzeLandingPage(briefing: string) {
  return callOpenAI(LANDING_ANALYZER_SYSTEM_PROMPT, briefing)
}

async function callOpenAIJson(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = readEnv('VITE_OPENAI_API_KEY')

  if (!apiKey?.trim()) {
    throw new Error(
      'VITE_OPENAI_API_KEY fehlt. Bitte trage deinen OpenAI API-Key in der .env-Datei ein.',
    )
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.65,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  const data = (await response.json()) as ChatCompletionResponse

  if (!response.ok) {
    throw new Error(
      data.error?.message ?? `OpenAI API Fehler (Status ${response.status})`,
    )
  }

  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('Keine Antwort von OpenAI erhalten.')
  }

  return content
}

/** @deprecated Use searchTrendIntelligence */
export type ScoutedTrend = ScoutedTrendRaw

export async function searchTrendIntelligence(niche: string): Promise<TrendIntelligence[]> {
  const content = await callOpenAIJson(
    TREND_SCOUT_SYSTEM_PROMPT,
    `Nische / Suchthema: ${niche.trim()}`,
  )
  const parsed = JSON.parse(content) as
    | ScoutedTrendRaw[]
    | { trends?: ScoutedTrendRaw[] }

  const raw = Array.isArray(parsed) ? parsed : parsed.trends

  if (!raw?.length) {
    throw new Error('Keine Trends in der Antwort erhalten.')
  }

  return raw.slice(0, 4).map((item, index) =>
    mapRawToTrendIntelligence(item, index, `live-${Date.now()}`),
  )
}

export async function searchTrends(niche: string): Promise<TrendIntelligence[]> {
  return searchTrendIntelligence(niche)
}

const TREND_HOOK_STYLES = {
  aggressive: 'Aggressive — direkt, konfrontativ, maximale Scroll-Stop-Power',
  luxury: 'Luxury — quiet luxury, premium, aspirational, ruhig aber hochwertig',
  storytelling:
    'Storytelling — narrativ, emotional, persönliche Geschichte, starke Retention',
  faceless: 'Faceless — voice-over, text-on-screen, skalierbar ohne Gesicht',
  ugc: 'UGC — authentisch, raw, relatable, wie von einem echten User',
} as const

export type TrendHookStyle = keyof typeof TREND_HOOK_STYLES

export type GenerateHooksInput = {
  style: TrendHookStyle
  niche: string
  trendTitle?: string
  hookText?: string
  description?: string
  hashtags?: string[]
  hookSuggestions?: string[]
  contentIdeas?: string[]
  platform?: string
  briefing?: string
}

function buildHookUserMessage(input: GenerateHooksInput): string {
  const lines: string[] = [`Nische / Trend-Thema: ${input.niche.trim()}`]

  if (input.trendTitle?.trim()) lines.push(`Trend-Titel: ${input.trendTitle.trim()}`)
  if (input.platform?.trim()) lines.push(`Plattform: ${input.platform.trim()}`)
  if (input.hookText?.trim()) lines.push(`Referenz-Hook (viral): ${input.hookText.trim()}`)
  if (input.description?.trim()) lines.push(`Trend-Kontext: ${input.description.trim()}`)
  if (input.hashtags?.length) lines.push(`Hashtags: ${input.hashtags.join(' ')}`)
  if (input.hookSuggestions?.length) {
    lines.push(`Weitere Hook-Ideen: ${input.hookSuggestions.join(' | ')}`)
  }
  if (input.contentIdeas?.length) {
    lines.push(`Content-Ideen: ${input.contentIdeas.join(' | ')}`)
  }
  if (input.briefing?.trim()) {
    lines.push(`Zusätzliches Briefing: ${input.briefing.trim()}`)
  }

  return lines.join('\n')
}

function buildHookSystemPrompt(style: TrendHookStyle): string {
  const styleDesc = TREND_HOOK_STYLES[style]
  return `Du bist ein Elite Viral Hook Copywriter für TikTok, Instagram Reels und YouTube Shorts (DACH-Markt).

Schreibe kurzform Hooks im Stil: ${styleDesc}.

Anforderungen:
- Scroll-Stopper für die ersten 1–3 Sekunden
- TikTok/Reels-native Formulierung (POV, „Stopp", direkte Ansprache, Neugier-Lücken)
- Hohe Retention durch offene Loops und Neugier — kein generischer Marketing-Sprech
- Max 120 Zeichen pro Hook, keine Hashtags, Deutsch
- Genau 4 einzigartige Hooks — jeder muss sich klar vom anderen unterscheiden
- Hooks müssen zur genannten Nische und zum Trend-Kontext passen

Antworte NUR mit JSON: {"hooks":["hook1","hook2","hook3","hook4"]}`
}

/** @deprecated Production uses hook-generator edge function via @/lib/ai/hook-generator */
export async function generateTrendHooks(input: GenerateHooksInput): Promise<string[]> {
  const niche = input.niche?.trim()
  if (!niche) throw new Error('Bitte wähle eine Nische oder gib ein Thema ein.')

  const content = await callOpenAIJson(
    buildHookSystemPrompt(input.style),
    buildHookUserMessage({ ...input, niche }),
  )

  const parsed = JSON.parse(content) as { hooks?: string[] }
  const hooks = parsed.hooks?.filter(
    (h): h is string => typeof h === 'string' && h.trim().length > 0,
  )
  if (!hooks?.length) throw new Error('Keine Hooks generiert.')
  return hooks.slice(0, 4)
}

/** Map trend intelligence into hook generation context */
export function trendToHookInput(
  trend: {
    title: string
    niche?: string
    platform: string
    description: string
    hashtags: string[]
    hookSuggestions: string[]
    contentIdeas: string[]
    hookAnalysis: { hookText: string }
  },
  style: TrendHookStyle,
  briefing?: string,
): GenerateHooksInput {
  return {
    style,
    niche: trend.niche?.trim() || trend.title,
    trendTitle: trend.title,
    hookText: trend.hookAnalysis.hookText,
    description: trend.description,
    hashtags: trend.hashtags,
    hookSuggestions: trend.hookSuggestions,
    contentIdeas: trend.contentIdeas,
    platform: trend.platform,
    briefing,
  }
}
