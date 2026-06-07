/** OpenAI-powered viral video strategy blueprint — no MP4 rendering. */

import { callOpenAIJson } from "./ai/openai-client.ts";

export type TrendStrategyInput = {
  trendId: string;
  title: string;
  niche?: string;
  platform?: string;
  description?: string;
  hookText?: string;
  videoDuration?: string;
  contentBreakdown?: {
    format?: string;
    pacing?: string;
    visualStyle?: string;
    ctaStrategy?: string;
    bestPostTime?: string;
    audioTrend?: string;
  };
  hookAnalysis?: {
    hookType?: string;
    hookText?: string;
    hookScore?: number;
    whyItWorks?: string;
    retentionTrigger?: string;
  };
  whyViral?: string;
  aiInsight?: string;
  engagementPrediction?: string;
  viralScore?: number;
  trendVelocity?: string;
  hookSuggestions?: string[];
  contentIdeas?: string[];
  aiRecommendations?: string[];
  ctaAngles?: string[];
  risingKeywords?: string[];
  hashtags?: string[];
  targetAudience?: string;
  monetizationPotential?: string;
  studioStyle?: string;
  studioDuration?: string;
};

export type StrategyHook = {
  text: string;
  retentionScore: number;
  style: string;
  duration: string;
};

export type StrategyScene = {
  id: number;
  label: string;
  timeRange: string;
  cameraAngle: string;
  visualDirection: string;
  pacing: string;
  overlayText: string;
  voiceoverLine?: string;
  shotPrompt?: string;
};

export type StrategyBlueprintPayload = {
  concept: string;
  hooks: StrategyHook[];
  scenes: StrategyScene[];
  captions: string[];
  cta: {
    engagement: string;
    follow: string;
    commentBait: string;
  };
  viralElements: {
    performanceHypothesis: string;
    emotionalTriggers: string[];
    algorithmFit: string[];
  };
  platformOptimization: {
    primary: string;
    tiktok: string;
    reels: string;
    shorts: string;
  };
  postingStrategy: string;
  voiceoverScript: string;
  pacing?: string;
  motionStyle?: string;
  visualMood?: string;
};

const SYSTEM_PROMPT = `You are NexTrends Creator OS — an elite short-form video strategist for TikTok, Instagram Reels, and YouTube Shorts.

Generate a complete, unique viral video STRATEGY blueprint from trend intelligence. Do NOT describe generic stock footage. Every output must be specific to the trend, niche, and platform.

Return JSON only with this exact shape:
{
  "concept": "one-line video idea",
  "hooks": [{"text":"...","retentionScore":85,"style":"Pattern Interrupt","duration":"0-3s"}],
  "scenes": [{"id":1,"label":"Hook","timeRange":"0-3s","cameraAngle":"...","visualDirection":"...","pacing":"...","overlayText":"...","voiceoverLine":"...","shotPrompt":"detailed 9:16 shot prompt"}],
  "captions": ["on-screen caption 1","caption 2","caption 3","caption 4"],
  "cta": {"engagement":"...","follow":"...","commentBait":"..."},
  "viralElements": {"performanceHypothesis":"...","emotionalTriggers":["..."],"algorithmFit":["..."]},
  "platformOptimization": {"primary":"TikTok","tiktok":"...","reels":"...","shorts":"..."},
  "postingStrategy": "when to post, hashtags, sound strategy, repost plan",
  "voiceoverScript": "full spoken script with line breaks, German unless niche is English",
  "pacing": "snappy|medium|slow burn",
  "motionStyle": "camera motion description",
  "visualMood": "audio/mood direction"
}

Rules:
- hooks: 3-4 variants, retentionScore 70-99, German copy for DE niches
- scenes: 3-5 beats covering hook → value → proof → CTA, each with unique shotPrompt for future AI video
- captions: 4-6 short overlay lines
- voiceoverScript: 15-45 seconds when read aloud, matches scene beats
- postingStrategy: actionable schedule + hashtag set + engagement tactics
- Use trend data provided — never ignore viralScore, whyViral, or hookAnalysis`;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim())
    .slice(0, max);
}

function normalizeHook(raw: unknown, index: number): StrategyHook | null {
  if (!raw || typeof raw !== "object") return null;
  const h = raw as Record<string, unknown>;
  const text = asString(h.text ?? h.hook);
  if (!text) return null;
  return {
    text,
    retentionScore: Math.min(99, Math.max(50, asNumber(h.retentionScore, 82 - index * 3))),
    style: asString(h.style, "Curiosity Gap"),
    duration: asString(h.duration, "0–3s"),
  };
}

function normalizeScene(raw: unknown, index: number): StrategyScene | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const visualDirection = asString(s.visualDirection ?? s.visual);
  if (!visualDirection) return null;
  return {
    id: asNumber(s.id, index + 1),
    label: asString(s.label, index === 0 ? "Hook" : `Beat ${index + 1}`),
    timeRange: asString(s.timeRange, `${index * 4}–${(index + 1) * 4}s`),
    cameraAngle: asString(s.cameraAngle, "POV Handheld"),
    visualDirection,
    pacing: asString(s.pacing, "Dynamic"),
    overlayText: asString(s.overlayText ?? s.overlay, visualDirection.slice(0, 60)),
    voiceoverLine: asString(s.voiceoverLine ?? s.voiceover) || undefined,
    shotPrompt: asString(s.shotPrompt ?? s.shot) || undefined,
  };
}

export function validateStrategyBlueprint(
  parsed: unknown,
  input: TrendStrategyInput,
): StrategyBlueprintPayload {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI-Antwort ist kein gültiges JSON-Objekt.");
  }

  const p = parsed as Record<string, unknown>;
  const concept = asString(p.concept ?? p.videoIdea ?? p.idea);
  if (!concept) {
    throw new Error("Video-Konzept fehlt in der AI-Antwort.");
  }

  const hooks = (Array.isArray(p.hooks) ? p.hooks : [])
    .map((h, i) => normalizeHook(h, i))
    .filter((h): h is StrategyHook => h !== null);

  if (hooks.length === 0) {
    throw new Error("Keine gültigen Hooks in der AI-Antwort.");
  }

  const scenes = (Array.isArray(p.scenes) ? p.scenes : [])
    .map((s, i) => normalizeScene(s, i))
    .filter((s): s is StrategyScene => s !== null);

  if (scenes.length === 0) {
    throw new Error("Keine gültigen Szenen in der AI-Antwort.");
  }

  const captions = asStringArray(p.captions, 8);
  if (captions.length === 0) {
    throw new Error("Captions fehlen in der AI-Antwort.");
  }

  const ctaRaw = (p.cta ?? {}) as Record<string, unknown>;
  const cta = {
    engagement: asString(ctaRaw.engagement, input.contentBreakdown?.ctaStrategy ?? "Speichern & teilen"),
    follow: asString(ctaRaw.follow, `Folge für mehr ${input.niche ?? "Viral"}-Content`),
    commentBait: asString(ctaRaw.commentBait, "Was denkst du? 👇"),
  };

  const viralRaw = (p.viralElements ?? {}) as Record<string, unknown>;
  const viralElements = {
    performanceHypothesis: asString(
      viralRaw.performanceHypothesis ?? viralRaw.hypothesis,
      input.whyViral ?? input.engagementPrediction ?? concept,
    ),
    emotionalTriggers: asStringArray(viralRaw.emotionalTriggers, 6).length > 0
      ? asStringArray(viralRaw.emotionalTriggers, 6)
      : [input.hookAnalysis?.retentionTrigger ?? "Curiosity"].filter(Boolean),
    algorithmFit: asStringArray(viralRaw.algorithmFit, 6).length > 0
      ? asStringArray(viralRaw.algorithmFit, 6)
      : [`${input.platform ?? "TikTok"} native`, input.contentBreakdown?.format ?? "Short-form"].filter(Boolean),
  };

  const platformRaw = (p.platformOptimization ?? {}) as Record<string, unknown>;
  const primary = asString(platformRaw.primary, input.platform ?? "TikTok");
  const platformOptimization = {
    primary,
    tiktok: asString(platformRaw.tiktok, "Hook in 0.8s · Trending sound · 3-5 Niche-Hashtags"),
    reels: asString(platformRaw.reels, "Clean aesthetic · Save-worthy tip · Carousel tease"),
    shorts: asString(platformRaw.shorts, "Title-card hook · SEO title · Subscribe CTA"),
  };

  const voiceoverScript = asString(
    p.voiceoverScript ?? p.voiceover,
    [hooks[0].text, ...captions.slice(1)].join("\n"),
  );

  const postingStrategy = asString(
    p.postingStrategy ?? p.posting,
    `Post on ${input.contentBreakdown?.bestPostTime ?? "peak hours"} · ${primary} · ${captions[0]}`,
  );

  return {
    concept,
    hooks,
    scenes,
    captions,
    cta,
    viralElements,
    platformOptimization,
    postingStrategy,
    voiceoverScript,
    pacing: asString(p.pacing, input.contentBreakdown?.pacing),
    motionStyle: asString(p.motionStyle),
    visualMood: asString(p.visualMood),
  };
}

export async function generateVideoStrategy(
  input: TrendStrategyInput,
): Promise<StrategyBlueprintPayload> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
    );
  }

  const userPayload = JSON.stringify({
    trend: {
      id: input.trendId,
      title: input.title,
      niche: input.niche ?? "General",
      platform: input.platform ?? "TikTok",
      description: input.description ?? "",
      videoDuration: input.studioDuration ?? input.videoDuration ?? "0:15",
      studioStyle: input.studioStyle,
    },
    viralInsights: {
      whyViral: input.whyViral,
      aiInsight: input.aiInsight,
      engagementPrediction: input.engagementPrediction,
      viralScore: input.viralScore,
      trendVelocity: input.trendVelocity,
      targetAudience: input.targetAudience,
      monetizationPotential: input.monetizationPotential,
    },
    hookAnalysis: input.hookAnalysis ?? { hookText: input.hookText },
    hookSuggestions: input.hookSuggestions ?? [],
    contentIdeas: input.contentIdeas ?? [],
    aiRecommendations: input.aiRecommendations ?? [],
    ctaAngles: input.ctaAngles ?? [],
    risingKeywords: input.risingKeywords ?? [],
    hashtags: input.hashtags ?? [],
    contentBreakdown: input.contentBreakdown ?? {},
  });

  console.log("[video-strategy] OpenAI request", {
    trendId: input.trendId,
    platform: input.platform,
    niche: input.niche,
  });

  const parsed = await callOpenAIJson<unknown>({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: userPayload,
    temperature: 0.88,
    jsonMode: true,
    maxTokens: 4096,
  });

  const blueprint = validateStrategyBlueprint(parsed, input);

  console.log("[video-strategy] OpenAI ok", {
    hooks: blueprint.hooks.length,
    scenes: blueprint.scenes.length,
    captions: blueprint.captions.length,
  });

  return blueprint;
}
