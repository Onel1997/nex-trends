import type {
  ContentBreakdown,
  CreatorInfo,
  HookAnalysis,
  ScoutedTrendRaw,
  TrendIntelligence,
  TrendVelocity,
} from '@/types/trend-intelligence'

export { DEMO_TREND_INTELLIGENCE } from '@/lib/trend-demo-data'

const CARD_GRADIENTS = [
  { from: 'from-violet-600', to: 'to-fuchsia-600' },
  { from: 'from-indigo-500', to: 'to-purple-600' },
  { from: 'from-cyan-500', to: 'to-blue-600' },
  { from: 'from-rose-500', to: 'to-orange-600' },
] as const

const MEDIA_FALLBACKS = [
  {
    thumbnail:
      'https://images.unsplash.com/photo-1611162617474-5b21e939e07a?w=720&h=1280&fit=crop&q=80',
    video:
      'https://videos.pexels.com/video-files/6774633/6774633-hd_1080_1920_25fps.mp4',
  },
  {
    thumbnail:
      'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=720&h=1280&fit=crop&q=80',
    video:
      'https://videos.pexels.com/video-files/3981768/3981768-hd_1080_1920_25fps.mp4',
  },
  {
    thumbnail:
      'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=720&h=1280&fit=crop&q=80',
    video:
      'https://videos.pexels.com/video-files/7692769/7692769-hd_1080_1920_25fps.mp4',
  },
  {
    thumbnail:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=720&h=1280&fit=crop&q=80',
    video:
      'https://videos.pexels.com/video-files/3129671/3129671-hd_1080_1920_25fps.mp4',
  },
] as const

const AVATAR_FALLBACKS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&q=80',
] as const

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

function parseHandle(creatorInspiration: string): string {
  const match = creatorInspiration.match(/@[\w.]+/)
  return match?.[0] ?? '@creator'
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

function buildDefaultCreator(creatorInspiration: string, index: number): CreatorInfo {
  const handle = parseHandle(creatorInspiration)
  const name = handle.replace('@', '').replace('.', ' · ')
  return {
    handle,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    avatarUrl: AVATAR_FALLBACKS[index % AVATAR_FALLBACKS.length],
    followers: `${120 + index * 80}K`,
    verified: index % 2 === 0,
  }
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

export function enrichTrendWithMedia(
  trend: TrendIntelligence,
  index: number,
): TrendIntelligence {
  if (trend.thumbnailUrl && trend.creator) return trend

  const media = MEDIA_FALLBACKS[index % MEDIA_FALLBACKS.length]
  const hookText = trend.hookSuggestions[0] ?? trend.title

  return {
    ...trend,
    thumbnailUrl: trend.thumbnailUrl || media.thumbnail,
    videoUrl: trend.videoUrl || media.video,
    videoDuration: trend.videoDuration || '0:45',
    likes: trend.likes || estimateLikes(trend.views, trend.engagement),
    engagementRate: trend.engagementRate || trend.engagement,
    creator: trend.creator || buildDefaultCreator(trend.creatorInspiration, index),
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
  const creatorInspiration =
    raw.creatorInspiration?.trim() ||
    `Creator im ${platform}-Format: schnelle Jump-Cuts, Text-Overlay, authentischer Voice-over.`
  const hookSuggestions = ensureStringArray(raw.hookSuggestions, [
    `„Wenn du ${hashtags[0]?.replace('#', '') || 'diesen Trend'} ignorierst, verpasst du 80 % Reichweite."`,
  ])
  const viralScore = clampScore(
    typeof raw.viralScore === 'number' ? raw.viralScore : 72 + index * 4,
  )

  const base: TrendIntelligence = {
    id: `${idPrefix}-${index}`,
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
    creatorInspiration,
    thumbnailUrl: '',
    videoUrl: undefined,
    videoDuration: '0:45',
    creator: buildDefaultCreator(creatorInspiration, index),
    hookAnalysis: buildDefaultHookAnalysis(hookSuggestions[0], clampScore(viralScore - 5)),
    contentBreakdown: buildDefaultContentBreakdown(platform),
    niche: raw.niche?.trim(),
    isDemo: false,
  }

  return enrichTrendWithMedia(base, index)
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
