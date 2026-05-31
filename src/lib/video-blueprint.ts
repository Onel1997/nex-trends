import { generateId } from '@/lib/utils'
import type { VideoGenerationResult } from '@/lib/video-generation-pipeline'
import type { TrendIntelligence } from '@/types/trend-intelligence'
import type {
  VideoBlueprint,
  VideoBlueprintHook,
  VideoBlueprintScene,
} from '@/types/video-blueprint'

const CAMERA_ANGLES = [
  'Extreme Close-Up (ECU)',
  'POV Handheld',
  'Low-Angle Hero Shot',
  'Over-the-Shoulder',
  'Dutch Angle Dynamic',
  'Macro Detail Pull',
  'Gimbal Orbit 360°',
  'Whip-Pan Transition',
] as const

const HOOK_STYLES = [
  'Pattern Interrupt',
  'Curiosity Gap',
  'Contrarian Take',
  'Social Proof',
  'Before/After Tease',
] as const

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h
}

function pick<T>(arr: readonly T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]
}

function platformKey(platform: string): 'tiktok' | 'reels' | 'shorts' {
  const p = platform.toLowerCase()
  if (p.includes('instagram') || p.includes('reel')) return 'reels'
  if (p.includes('youtube') || p.includes('short')) return 'shorts'
  return 'tiktok'
}

function buildHooks(trend: TrendIntelligence, seed: number, primary: string): VideoBlueprintHook[] {
  const candidates = [
    primary,
    trend.hookAnalysis.hookText,
    ...(trend.hookSuggestions ?? []),
    ...(trend.contentIdeas ?? []).slice(0, 1),
  ].filter(Boolean)

  const unique = [...new Set(candidates)].slice(0, 4)

  return unique.map((text, i) => ({
    text,
    retentionScore: Math.min(99, trend.hookAnalysis.hookScore + 4 - i * 3 + (seed % 5)),
    style: pick(HOOK_STYLES, seed, i),
    duration: '0–3s',
  }))
}

function sceneTimeRanges(count: number, duration: string): string[] {
  const seconds = duration.includes('0:30') ? 30 : duration.includes('0:60') ? 60 : 15
  const slice = Math.floor(seconds / count)
  return Array.from({ length: count }, (_, i) => {
    const start = i * slice
    const end = i === count - 1 ? seconds : (i + 1) * slice
    return `${start}–${end}s`
  })
}

function buildScenes(
  trend: TrendIntelligence,
  result: VideoGenerationResult,
  captions: string[],
  seed: number,
): VideoBlueprintScene[] {
  const scenePrompt = result.scenePrompt ?? trend.contentBreakdown.visualStyle
  const pacing = result.pacing ?? trend.contentBreakdown.pacing
  const motion = result.motionStyle ?? 'Dynamic cuts'
  const duration = result.duration ?? trend.videoDuration ?? '0:15'
  const ranges = sceneTimeRanges(Math.min(4, captions.length), duration)

  const visualBeats = [
    `Hook reveal — ${scenePrompt}`,
    `Value build — ${trend.niche ?? 'Niche'} insight with ${motion}`,
    `Proof / demo — social proof overlay, ${trend.contentBreakdown.format}`,
    `CTA close — neon accent, direct eye-line`,
  ]

  return ranges.map((timeRange, i) => ({
    id: i + 1,
    label: i === 0 ? 'Hook' : i === ranges.length - 1 ? 'CTA Outro' : `Beat ${i + 1}`,
    timeRange,
    cameraAngle: pick(CAMERA_ANGLES, seed, i + 1),
    visualDirection: visualBeats[i] ?? visualBeats[visualBeats.length - 1],
    pacing: i === 0 ? 'Snap cut — 0.5s impact' : i === ranges.length - 1 ? 'Hold + breathe' : pacing,
    overlayText: captions[i] ?? captions[captions.length - 1],
    voiceoverLine: captions[i],
    shotPrompt: `${scenePrompt}. Scene ${i + 1}: ${visualBeats[i]}. 9:16 vertical.`,
  }))
}

function buildPlatformOptimization(trend: TrendIntelligence): VideoBlueprint['platformOptimization'] {
  const niche = trend.niche ?? 'Creator'
  const key = platformKey(trend.platform)

  const tips = {
    tiktok: `Front-load hook in 0.8s · trending sound layer · ${niche} hashtags · duet-stitch bait in caption`,
    reels: `Clean aesthetic · carousel tease in caption · save-worthy tip mid-video · subtle brand safe`,
    shorts: `Title-card hook · chapter markers · SEO title: "${trend.title.slice(0, 55)}" · end-screen subscribe CTA`,
  }

  const primaryTip = tips[key]
  return {
    primary: trend.platform,
    tiktok: key === 'tiktok' ? `★ ${primaryTip}` : tips.tiktok,
    reels: key === 'reels' ? `★ ${primaryTip}` : tips.reels,
    shorts: key === 'shorts' ? `★ ${primaryTip}` : tips.shorts,
  }
}

export function buildVideoBlueprint(
  trend: TrendIntelligence,
  result: VideoGenerationResult,
): VideoBlueprint {
  const seed = hashSeed(`${trend.id}:${result.jobId ?? generateId()}`)
  const primaryHook = result.hookText ?? trend.hookAnalysis.hookText
  const captions = result.captions?.length
    ? result.captions
    : [
        primaryHook.slice(0, 72),
        `Warum ${trend.niche ?? 'das'} gerade explodiert`,
        trend.engagementPrediction.slice(0, 60),
        trend.contentBreakdown.ctaStrategy,
      ]

  const concept =
    trend.aiInsight ??
    `${trend.title} — scroll-stopping ${trend.niche ?? 'viral'} short optimized for ${trend.platform}`

  const scenes = buildScenes(trend, result, captions, seed)

  return {
    id: generateId(),
    trendId: trend.id,
    trendTitle: trend.title,
    platform: trend.platform,
    niche: trend.niche ?? trend.contentBreakdown.format,
    createdAt: new Date().toISOString(),
    concept,
    hooks: buildHooks(trend, seed, primaryHook),
    scenes,
    captions,
    cta: {
      engagement: trend.ctaAngles?.[0] ?? `Speichere das — ${trend.niche ?? 'Trend'} peakt gerade`,
      follow: `Folge für tägliche ${trend.niche ?? 'Viral'}-Breakdowns`,
      commentBait: trend.hookSuggestions?.[0] ?? 'Was würdest du als Hook testen? 👇',
    },
    viralElements: {
      performanceHypothesis:
        trend.whyViral ??
        trend.engagementPrediction ??
        `High retention via ${trend.hookAnalysis.retentionTrigger} — Score ${trend.viralScore}/100`,
      emotionalTriggers: [
        trend.hookAnalysis.retentionTrigger,
        ...(trend.aiRecommendations?.slice(0, 2) ?? ['Curiosity', 'FOMO']),
      ],
      algorithmFit: [
        `${trend.trendVelocity} velocity · ${trend.platform} native format`,
        trend.contentBreakdown.format,
        `Best post: ${trend.contentBreakdown.bestPostTime}`,
        ...(trend.risingKeywords?.slice(0, 2).map((k) => `#${k.replace(/^#/, '')}`) ?? []),
      ],
    },
    platformOptimization: buildPlatformOptimization(trend),
    pipeline: {
      voiceover: {
        status: result.voiceoverUrl ? 'completed' : result.hasAudio ? 'ready' : 'pending',
        script: [primaryHook, ...captions.slice(1)].join(' → '),
        voiceStyle: result.visualMood ?? 'Confident creator DE',
        url: result.voiceoverUrl,
      },
      shots: {
        status: result.videoUrl ? 'completed' : 'generating',
        items: scenes.map((s) => ({
          sceneId: s.id,
          prompt: s.shotPrompt ?? s.visualDirection,
          url: result.videoUrl && s.id === 1 ? result.videoUrl : undefined,
        })),
      },
      avatar: { status: 'disabled', config: null },
      render: {
        status: result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'processing',
        url: result.videoUrl,
        posterUrl: result.posterUrl,
        provider: result.provider,
        jobId: result.jobId,
      },
    },
  }
}
