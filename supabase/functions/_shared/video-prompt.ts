/** Builds unique scene + hook prompts per generation (OpenAI when key present). */

export type VideoCreativeBrief = {
  scenePrompt: string
  hookText: string
  captions: string[]
  pacing: string
  motionStyle: string
  visualMood: string
}

const SCENE_TEMPLATES = [
  "cinematic vertical shot, {niche} content, {motion}, golden hour lighting, shallow depth of field",
  "dynamic handheld POV, {niche} trend moment, {motion}, neon accents, high contrast",
  "studio macro product reveal, {niche}, {motion}, clean backdrop, crisp highlights",
  "urban street lifestyle, {niche} creator energy, {motion}, natural motion blur",
  "cozy indoor aesthetic, {niche} storytelling beat, {motion}, warm tones, soft bokeh",
  "aerial drone pullback, {niche} landscape hook, {motion}, epic scale, 9:16 frame",
] as const

const MOTION_STYLES = [
  "slow push-in then whip pan",
  "fast cuts every 1.5s with match motion",
  "smooth gimbal orbit around subject",
  "handheld urgency with snap zoom",
  "time-lapse into real-time reveal",
  "parallax layers with foreground movement",
] as const

const PACING = ["snappy", "medium tempo", "slow burn", "hyper-cut", "breathing room"] as const

const MUSIC_MOODS = [
  "upbeat electronic pulse",
  "lo-fi chill groove",
  "dramatic cinematic swell",
  "trending phonk bass",
  "acoustic feel-good",
] as const

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

function pick<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]
}

/** Deterministic unique brief when OpenAI is unavailable. */
export function buildDeterministicBrief(input: {
  trendId: string
  title: string
  niche?: string
  platform?: string
  hookText?: string
  generationNonce: string
}): VideoCreativeBrief {
  const seed = hashSeed(
    `${input.trendId}:${input.generationNonce}:${Date.now()}`,
  )
  const niche = input.niche?.trim() || "social media"
  const motion = pick(MOTION_STYLES, seed)
  const template = pick(SCENE_TEMPLATES, seed, 1)
  const scenePrompt = template
    .replace("{niche}", niche)
    .replace("{motion}", motion)
  const hookText = input.hookText?.trim() ||
    `${input.title} — scroll-stopping hook for ${input.platform ?? "TikTok"}`

  const captions = [
    hookText.slice(0, 72),
    `Why ${niche} is blowing up right now`,
    "Save this before it peaks",
    "Follow for part 2",
  ]

  return {
    scenePrompt: `${scenePrompt}. Portrait 9:16 vertical video, premium short-form ad quality, no watermark, no text overlays in scene.`,
    hookText,
    captions,
    pacing: pick(PACING, seed, 2),
    motionStyle: motion,
    visualMood: pick(MUSIC_MOODS, seed, 3),
  }
}

export async function buildOpenAIBrief(input: {
  title: string
  niche?: string
  platform?: string
  description?: string
  hookText?: string
  contentBreakdown?: {
    pacing?: string
    visualStyle?: string
    format?: string
  }
}): Promise<VideoCreativeBrief | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim()
  if (!apiKey) return null

  const userPayload = JSON.stringify({
    title: input.title,
    niche: input.niche ?? "General",
    platform: input.platform ?? "TikTok",
    description: input.description ?? "",
    existingHook: input.hookText ?? "",
    breakdown: input.contentBreakdown ?? {},
  })

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.92,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `You create UNIQUE short-form video creative briefs for 9:16 portrait videos.
Return JSON only: {"scenePrompt":"...","hookText":"...","captions":["line1","line2","line3","line4"],"pacing":"...","motionStyle":"...","visualMood":"..."}.
scenePrompt must describe a never-before-used visual scene (no stock clichés). captions are on-screen text lines in German or English matching niche. Each generation must differ in scene, pacing, and motion.`,
        },
        { role: "user", content: userPayload },
      ],
    }),
  })

  if (!res.ok) {
    console.warn("[video-prompt] OpenAI failed", res.status)
    return null
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const raw = data.choices?.[0]?.message?.content?.trim()
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as VideoCreativeBrief
    if (!parsed.scenePrompt || !parsed.hookText) return null
    parsed.captions = Array.isArray(parsed.captions)
      ? parsed.captions.filter((c) => typeof c === "string").slice(0, 6)
      : []
    return parsed
  } catch {
    return null
  }
}

export async function resolveVideoBrief(input: {
  trendId: string
  title: string
  niche?: string
  platform?: string
  description?: string
  hookText?: string
  contentBreakdown?: {
    pacing?: string
    visualStyle?: string
    format?: string
  }
  generationNonce: string
}): Promise<VideoCreativeBrief> {
  const ai = await buildOpenAIBrief(input)
  if (ai) return ai
  return buildDeterministicBrief(input)
}
