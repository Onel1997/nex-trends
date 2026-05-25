import type {
  ContentBreakdown,
  GrowthIndicator,
  HeatLevel,
  HookAnalysis,
  ScoutedTrendRaw,
  TrendIntelligence,
  TrendVelocity,
} from '@/types/trend-intelligence'
import { assignCreatorForTrend, formatCreatorInspiration } from '@/lib/demo-creators'
import { buildCatalogMediaSlot } from '@/lib/trend-media-assignment'
import { hashString } from '@/lib/demo-trend-seed'
import { isValidVideoUrl } from '@/lib/video-url'

export { DEMO_TREND_INTELLIGENCE } from '@/lib/trend-demo-data'

const CARD_GRADIENTS = [
  { from: 'from-violet-600', to: 'to-fuchsia-600' },
  { from: 'from-indigo-500', to: 'to-purple-600' },
  { from: 'from-cyan-500', to: 'to-blue-600' },
  { from: 'from-rose-500', to: 'to-orange-600' },
] as const

function stableMediaForTrendId(trendId: string, index: number) {
  const slot = hashString(`${trendId}:${index}`) % 997
  const media = buildCatalogMediaSlot(slot)
  return { thumbnail: media.poster, video: media.video, duration: media.duration }
}


const DEMO_STORAGE_KEY = 'nextrends_demo_seen'

export function markDemoSeen(): void {
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, '1')
  } catch {
    // ignore
  }
}

export function shouldShowDemoOnLoad(): boolean {
  try {
    return sessionStorage.getItem(DEMO_STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

function normalizeVelocity(value: string | undefined): TrendVelocity {
  const v = value?.toLowerCase().trim()
  if (v === 'rising' || v === 'steigend' || v === 'up') return 'rising'
  if (v === 'peak' || v === 'spitze' || v === 'hot') return 'peak'
  if (v === 'cooling' || v === 'fallend' || v === 'down') return 'cooling'
  return 'stable'
}

function clampScore(score: number): number {
  return Math.min(99, Math.max(42, Math.round(score)))
}

function ensureStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  const items = value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
  return items.length > 0 ? items.slice(0, 6) : fallback
}

function estimateLikes(views: string, engagement: string): string {
  const viewsNum = parseMetric(views)
  const engNum = parseFloat(engagement.replace('%', '').replace(',', '.')) || 8
  const likes = Math.round(viewsNum * (engNum / 100) * 0.35)
  return formatMetric(likes)
}

function parseMetric(value: string): number {
  const v = value.trim().toUpperCase()
  const num = parseFloat(v)
  if (v.endsWith('M')) return num * 1_000_000
  if (v.endsWith('K')) return num * 1_000
  return num || 100_000
}

function formatMetric(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

function buildDefaultHookAnalysis(
  hookText: string,
  hookScore: number,
): HookAnalysis {
  return {
    hookType: 'Scroll-Stopper',
    hookText,
    hookScore,
    whyItWorks:
      'Starke Neugierde in den ersten 3 Sekunden. Relatable Angle triggert Comments und Shares.',
    retentionTrigger: 'Pattern Interrupt bei Sekunde 2–4 hält Watch-Time hoch',
  }
}

function buildDefaultContentBreakdown(platform: string): ContentBreakdown {
  return {
    format: platform === 'Instagram' ? 'Reel · 9:16 · 15–30s' : 'Short-Form · 9:16 · 45–60s',
    pacing: 'Schnelle Cuts, synchronisierte Text-Overlays',
    audioTrend: 'Trending Audio in Nische — prüfe Sound-Bibliothek',
    visualStyle: 'Authentisch, mobile-first, hoher Kontrast',
    ctaStrategy: 'Soft CTA: Speichern oder Folgen',
    bestPostTime: 'Di–Do · 18:00–21:00 Uhr (DACH Peak)',
  }
}

function enrichCreatorFields(trend: TrendIntelligence): Pick<
  TrendIntelligence,
  'creator' | 'creatorInspiration'
> {
  const creator = trend.creator?.handle
    ? trend.creator
    : assignCreatorForTrend(trend.id, trend.platform)
  const creatorInspiration =
    trend.creatorInspiration?.trim() || formatCreatorInspiration(creator, trend.platform)

  return { creator, creatorInspiration }
}

export function enrichTrendWithMedia(
  trend: TrendIntelligence,
  index: number,
): TrendIntelligence {
  const hasValidVideo = isValidVideoUrl(trend.videoUrl)
  if (
    trend.thumbnailUrl &&
    hasValidVideo &&
    trend.creator?.handle &&
    trend.creator.avatarUrl
  ) {
    return trend
  }

  const media = stableMediaForTrendId(trend.id, index)
  const hookText = trend.hookSuggestions[0] ?? trend.title
  const { creator, creatorInspiration } = enrichCreatorFields(trend)

  return {
    ...trend,
    thumbnailUrl: trend.thumbnailUrl || media.thumbnail,
    videoUrl: trend.videoUrl || media.video,
    videoDuration: trend.videoDuration || media.duration,
    likes: trend.likes || estimateLikes(trend.views, trend.engagement),
    engagementRate: trend.engagementRate || trend.engagement,
    creator,
    creatorInspiration,
    hookAnalysis:
      trend.hookAnalysis ||
      buildDefaultHookAnalysis(hookText, clampScore(trend.viralScore - 5)),
    contentBreakdown:
      trend.contentBreakdown || buildDefaultContentBreakdown(trend.platform),
  }
}

export function mapRawToTrendIntelligence(
  raw: ScoutedTrendRaw,
  index: number,
  idPrefix = 'trend',
): TrendIntelligence {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const platform = raw.platform?.trim() || 'TikTok'
  const title = raw.title?.trim() || 'Viraler Trend'
  const hashtags = ensureStringArray(raw.hashtags, [
    `#${title.split(' ')[0]?.toLowerCase() || 'trend'}`,
  ])
  const views = raw.views?.trim() || '1.2M'
  const engagement = raw.engagement?.trim() || '8.2%'
  const hookSuggestions = ensureStringArray(raw.hookSuggestions, [
    `„Wenn du ${hashtags[0]?.replace('#', '') || 'diesen Trend'} ignorierst, verpasst du 80 % Reichweite."`,
  ])
  const viralScore = clampScore(
    typeof raw.viralScore === 'number' ? raw.viralScore : 72 + index * 4,
  )

  const trendId = `${idPrefix}-${index}`
  const assignedCreator = assignCreatorForTrend(trendId, platform)

  const base: TrendIntelligence = {
    id: trendId,
    title,
    platform,
    views,
    likes: raw.likes?.trim() || estimateLikes(views, engagement),
    engagement,
    engagementRate: engagement,
    description:
      raw.description?.trim() ||
      'Hohes Re-Share-Potenzial durch starke Hook-Struktur und plattformgerechtes Format.',
    gradientFrom: gradient.from,
    gradientTo: gradient.to,
    viralScore,
    trendVelocity: normalizeVelocity(raw.trendVelocity),
    hashtags,
    engagementPrediction:
      raw.engagementPrediction?.trim() ||
      `Erwartete Engagement-Rate ${engagement} in den nächsten 48h.`,
    contentIdeas: ensureStringArray(raw.contentIdeas, [
      `3-Clip-Serie zum Thema „${title.slice(0, 40)}" mit starker Hook in Sekunde 1.`,
    ]),
    hookSuggestions,
    creatorInspiration: formatCreatorInspiration(assignedCreator, platform),
    thumbnailUrl: '',
    videoUrl: undefined,
    videoDuration: '0:45',
    creator: assignedCreator,
    hookAnalysis: buildDefaultHookAnalysis(hookSuggestions[0], clampScore(viralScore - 5)),
    contentBreakdown: buildDefaultContentBreakdown(platform),
    niche: raw.niche?.trim(),
    isDemo: false,
  }

  return enrichTrendIntelligence(enrichTrendWithMedia(base, index), index)
}

export const VELOCITY_META: Record<
  TrendVelocity,
  { label: string; className: string; icon: string }
> = {
  rising: {
    label: 'Steigend',
    className: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/25',
    icon: '↑',
  },
  peak: {
    label: 'Peak',
    className: 'text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/25',
    icon: '⚡',
  },
  stable: {
    label: 'Stabil',
    className: 'text-zinc-300 bg-zinc-500/10 ring-zinc-500/25',
    icon: '→',
  },
  cooling: {
    label: 'Abkühlend',
    className: 'text-amber-300 bg-amber-500/10 ring-amber-500/25',
    icon: '↓',
  },
}

export function parseEngagementPercent(value: string): number {
  const num = parseFloat(value.replace('%', '').replace(',', '.').trim())
  return Number.isFinite(num) ? num : 8
}

export function deriveEngagementScore(trend: TrendIntelligence): number {
  if (trend.engagementScore != null) return trend.engagementScore
  const eng = parseEngagementPercent(trend.engagementRate || trend.engagement)
  return Math.min(100, Math.round(eng * 10))
}

export function deriveHeatLevel(trend: TrendIntelligence): HeatLevel {
  if (trend.heatLevel) return trend.heatLevel
  const score = trend.viralScore
  if (score >= 88 && trend.trendVelocity !== 'cooling') return 'viral'
  if (score >= 75) return 'hot'
  if (score >= 60) return 'warm'
  return 'cold'
}

export function deriveGrowthIndicator(trend: TrendIntelligence): GrowthIndicator {
  if (trend.growthIndicator) return trend.growthIndicator
  const map: Record<TrendVelocity, GrowthIndicator> = {
    rising: 'up',
    peak: 'up',
    stable: 'stable',
    cooling: 'down',
  }
  return map[trend.trendVelocity]
}

export const HEAT_META: Record<
  HeatLevel,
  { label: string; className: string; dots: number }
> = {
  cold: { label: 'Kalt', className: 'text-zinc-400 bg-zinc-500/10 ring-zinc-500/20', dots: 1 },
  warm: { label: 'Warm', className: 'text-amber-300 bg-amber-500/10 ring-amber-500/20', dots: 2 },
  hot: { label: 'Hot', className: 'text-orange-300 bg-orange-500/10 ring-orange-500/20', dots: 3 },
  viral: { label: 'Viral', className: 'text-rose-300 bg-rose-500/10 ring-rose-500/20', dots: 4 },
}

function buildIntelligenceExtras(
  trend: TrendIntelligence,
  index: number,
): Pick<
  TrendIntelligence,
  'targetAudience' | 'whyViral' | 'aiRecommendations' | 'heatLevel' | 'growthIndicator' | 'engagementScore'
> {
  const engagementScore = deriveEngagementScore(trend)
  const heatLevel = deriveHeatLevel(trend)
  const growthIndicator = deriveGrowthIndicator(trend)
  const niche = trend.niche || 'deine Nische'

  return {
    engagementScore,
    heatLevel,
    growthIndicator,
    targetAudience:
      trend.targetAudience ||
      `18–34 · ${niche}-Interessierte · DACH · hohe Mobile-Nutzung · ${trend.platform}-aktiv`,
    whyViral:
      trend.whyViral ||
      `${trend.hookAnalysis.hookType} trifft den Algorithmus-Moment: ${trend.trendVelocity === 'rising' ? 'steigende' : 'stabile'} Velocity bei ${trend.engagementRate} Engagement. Das Format passt perfekt zu ${trend.platform}-Consumption Patterns.`,
    aiRecommendations:
      trend.aiRecommendations || [
        `Adaptiere den Hook „${trend.hookAnalysis.hookText.slice(0, 50)}…" für deine Brand Voice.`,
        `Poste innerhalb von 24h — ${trend.contentBreakdown.bestPostTime}.`,
        `Teste ${trend.hashtags.slice(0, 2).join(' ')} in Kombination mit einem eigenen Branded Hashtag.`,
        index % 2 === 0
          ? 'A/B-Teste zwei Thumbnail-Frames in den ersten 2 Sekunden.'
          : 'Nutze einen Duet/Stitch mit einem Top-Profil in der Nische.',
      ],
  }
}

export function enrichTrendIntelligence(
  trend: TrendIntelligence,
  index: number,
): TrendIntelligence {
  const withMedia = enrichTrendWithMedia(trend, index)
  return { ...withMedia, ...buildIntelligenceExtras(withMedia, index) }
}

export function getViralScoreTone(score: number): {
  label: string
  ringClass: string
  textClass: string
  bgClass: string
} {
  if (score >= 90) {
    return {
      label: 'Sehr hoch',
      ringClass: 'stroke-emerald-400',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
    }
  }
  if (score >= 75) {
    return {
      label: 'Hoch',
      ringClass: 'stroke-violet-400',
      textClass: 'text-violet-400',
      bgClass: 'bg-violet-500/10',
    }
  }
  if (score >= 60) {
    return {
      label: 'Mittel',
      ringClass: 'stroke-amber-400',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
    }
  }
  return {
    label: 'Moderat',
    ringClass: 'stroke-zinc-500',
    textClass: 'text-zinc-400',
    bgClass: 'bg-zinc-500/10',
  }
}

export { CARD_GRADIENTS }
