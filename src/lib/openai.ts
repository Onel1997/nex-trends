const AD_COPY_SYSTEM_PROMPT =
  'Du bist ein Top-Experte für Social Media Marketing, speziell TikTok und Instagram Reels. Schreibe ein kurzes, extrem virales Skript. Strukturiere es in 3 Teile: 1. Hook (Scroll-Stopper), 2. Body (Mehrwert/Problem lösen), 3. CTA (Call to Action). Halte es knackig und modern.'

const HOOK_SYSTEM_PROMPT =
  'Du bist ein Viralitäts-Experte für Kurzvideos (TikTok, Reels, Shorts). Der User nennt dir ein Thema. Schreibe 5 extrem aufmerksamkeitsstarke, psychologisch clevere Hooks (Scroll-Stopper) für die ersten 3 Sekunden eines Videos. Nutze keine Hashtags, sondern fokussiere dich auf starke Aussagen oder Neugierde weckende Fragen.'

const SEO_TITLE_SYSTEM_PROMPT =
  'Du bist ein SEO-Experte und Copywriter. Der User nennt dir ein Keyword oder Thema. Erstelle 5 klickstarke, SEO-optimierte Titel (max. 60 Zeichen) für Blogbeiträge oder Produktseiten, die eine hohe CTR (Click-Through-Rate) garantieren. Mache sie ansprechend für Suchmaschinen und Menschen.'

const LANDING_ANALYZER_SYSTEM_PROMPT =
  'Du bist ein Conversion-Rate-Optimierer (CRO). Der User gibt eine Idee, Zielgruppe oder ein Produkt für eine Landingpage ein. Analysiere das Potenzial und gib 3 konkrete, psychologische Tipps, wie man die Landingpage aufbauen muss, um maximale Verkäufe/Leads zu generieren. Nutze übersichtliche Bulletpoints.'

const TREND_SCOUT_SYSTEM_PROMPT =
  'Du bist ein Social Media Trend-Analyst. Der User nennt dir eine Nische. Generiere 4 aktuell virale Content-Trends für TikTok und Instagram als JSON-Array. Jedes Objekt muss folgende Keys haben: title (Titel des Trends), platform (TikTok oder Instagram), views (realistische, hohe Aufrufzahl als String, z.B. 1.2M), engagement (z.B. 8.5%), description (kurze Erklärung, warum es viral geht). Antworte ausschließlich mit einem JSON-Objekt der Form {"trends": [...]} ohne weiteren Text.'

export type ScoutedTrend = {
  title: string
  platform: string
  views: string
  engagement: string
  description: string
}

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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

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
      model: 'gpt-3.5-turbo',
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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

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
      model: 'gpt-3.5-turbo',
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

export async function searchTrends(niche: string): Promise<ScoutedTrend[]> {
  const content = await callOpenAIJson(TREND_SCOUT_SYSTEM_PROMPT, niche)
  const parsed = JSON.parse(content) as
    | ScoutedTrend[]
    | { trends?: ScoutedTrend[] }

  const raw = Array.isArray(parsed) ? parsed : parsed.trends

  if (!raw?.length) {
    throw new Error('Keine Trends in der Antwort erhalten.')
  }

  return raw.slice(0, 4)
}
