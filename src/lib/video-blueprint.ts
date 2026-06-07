import { generateId } from '@/lib/utils'
import type { VideoGenerationResult } from '@/lib/video-generation-pipeline'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import type {
  VideoBlueprint,
  VideoBlueprintCta,
  VideoBlueprintHook,
  VideoBlueprintPlatformOptimization,
  VideoBlueprintScene,
  VideoBlueprintViralElements,
} from '@/types/video-blueprint'

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function asNumber(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim())
    .slice(0, max)
}

function mapHooks(raw: unknown): VideoBlueprintHook[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null
      const h = item as Record<string, unknown>
      const text = asString(h.text ?? h.hook)
      if (!text) return null
      return {
        text,
        retentionScore: asNumber(h.retentionScore, 80 - i * 3),
        style: asString(h.style, 'Curiosity Gap'),
        duration: asString(h.duration, '0–3s'),
      }
    })
    .filter((h): h is VideoBlueprintHook => h !== null)
}

function mapScenes(raw: unknown): VideoBlueprintScene[] {
  if (!Array.isArray(raw)) return []
  const scenes: VideoBlueprintScene[] = []
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i]
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    const visualDirection = asString(s.visualDirection ?? s.visual)
    if (!visualDirection) continue
    const scene: VideoBlueprintScene = {
      id: asNumber(s.id, i + 1),
      label: asString(s.label, `Scene ${i + 1}`),
      timeRange: asString(s.timeRange, `${i * 4}–${(i + 1) * 4}s`),
      cameraAngle: asString(s.cameraAngle, 'POV Handheld'),
      visualDirection,
      pacing: asString(s.pacing, 'Dynamic'),
      overlayText: asString(s.overlayText ?? s.overlay, visualDirection.slice(0, 60)),
    }
    const voiceoverLine = asString(s.voiceoverLine ?? s.voiceover)
    const shotPrompt = asString(s.shotPrompt ?? s.shot)
    if (voiceoverLine) scene.voiceoverLine = voiceoverLine
    if (shotPrompt) scene.shotPrompt = shotPrompt
    scenes.push(scene)
  }
  return scenes
}

function mapCta(raw: unknown, trend: TrendIntelligence): VideoBlueprintCta {
  const c = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    engagement: asString(c.engagement, trend.ctaAngles?.[0] ?? 'Speichern & teilen'),
    follow: asString(c.follow, `Folge für mehr ${trend.niche ?? 'Viral'}-Content`),
    commentBait: asString(c.commentBait, trend.hookSuggestions?.[0] ?? 'Was denkst du? 👇'),
  }
}

function mapViralElements(raw: unknown, trend: TrendIntelligence): VideoBlueprintViralElements {
  const v = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    performanceHypothesis: asString(
      v.performanceHypothesis ?? v.hypothesis,
      trend.whyViral ?? trend.engagementPrediction ?? trend.aiInsight ?? '',
    ),
    emotionalTriggers: asStringArray(v.emotionalTriggers, 6).length > 0
      ? asStringArray(v.emotionalTriggers, 6)
      : [trend.hookAnalysis.retentionTrigger, ...(trend.aiRecommendations?.slice(0, 2) ?? [])].filter(Boolean),
    algorithmFit: asStringArray(v.algorithmFit, 6).length > 0
      ? asStringArray(v.algorithmFit, 6)
      : [
          `${trend.trendVelocity} velocity · ${trend.platform}`,
          trend.contentBreakdown.format,
          `Best post: ${trend.contentBreakdown.bestPostTime}`,
        ],
  }
}

function mapPlatformOptimization(
  raw: unknown,
  trend: TrendIntelligence,
): VideoBlueprintPlatformOptimization {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    primary: asString(p.primary, trend.platform),
    tiktok: asString(p.tiktok, 'Hook in 0.8s · Trending sound · Niche hashtags'),
    reels: asString(p.reels, 'Clean aesthetic · Save-worthy tip'),
    shorts: asString(p.shorts, 'Title-card hook · SEO title · Subscribe CTA'),
  }
}

/** Maps OpenAI strategy response from edge function into client VideoBlueprint. */
export function buildVideoBlueprint(
  trend: TrendIntelligence,
  result: VideoGenerationResult,
): VideoBlueprint {
  const server = (result.blueprint ?? {}) as Record<string, unknown>
  const primaryHook = result.hookText ?? asString(
    (server.hooks as unknown[])?.[0] &&
      typeof (server.hooks as unknown[])[0] === 'object'
      ? ((server.hooks as Record<string, unknown>[])[0]?.text)
      : undefined,
    trend.hookAnalysis.hookText,
  )

  const hooks = mapHooks(server.hooks)
  const scenes = mapScenes(server.scenes)
  const captions = asStringArray(server.captions, 8).length > 0
    ? asStringArray(server.captions, 8)
    : result.captions ?? [primaryHook]

  const voiceoverScript = asString(
    server.voiceoverScript ?? server.voiceover,
    hooks.map((h) => h.text).join('\n') || primaryHook,
  )

  const postingStrategy = result.postingStrategy ?? asString(server.postingStrategy)

  return {
    id: generateId(),
    trendId: trend.id,
    trendTitle: trend.title,
    platform: trend.platform,
    niche: trend.niche ?? trend.contentBreakdown.format,
    createdAt: new Date().toISOString(),
    concept: asString(server.concept, trend.aiInsight ?? trend.title),
    hooks: hooks.length > 0 ? hooks : [{
      text: primaryHook,
      retentionScore: trend.hookAnalysis.hookScore,
      style: trend.hookAnalysis.hookType,
      duration: '0–3s',
    }],
    scenes: scenes.length > 0 ? scenes : [],
    captions,
    cta: mapCta(server.cta, trend),
    viralElements: mapViralElements(server.viralElements, trend),
    platformOptimization: mapPlatformOptimization(server.platformOptimization, trend),
    postingStrategy,
    pipeline: {
      voiceover: {
        status: 'ready',
        script: voiceoverScript,
        voiceStyle: result.visualMood ?? 'Confident creator DE',
        url: result.voiceoverUrl,
      },
      shots: {
        status: 'pending',
        items: scenes.map((s) => ({
          sceneId: s.id,
          prompt: s.shotPrompt ?? s.visualDirection,
        })),
      },
      avatar: { status: 'disabled', config: null },
      render: {
        status: result.videoUrl ? 'completed' : 'pending',
        url: result.videoUrl || undefined,
        posterUrl: result.posterUrl || undefined,
        provider: result.provider,
        jobId: result.jobId,
      },
    },
  }
}
