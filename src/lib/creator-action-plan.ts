import { createSeededRandom, hashString } from '@/lib/demo-trend-seed'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export type CreatorVideoIdea = {
  title: string
  hook: string
  steps: [string, string, string]
  cta: string
}

export type CreatorActionPlan = {
  videoIdeas: [CreatorVideoIdea, CreatorVideoIdea, CreatorVideoIdea]
  caption: string
  hashtags: string[]
}

const IDEA_ANGLES = [
  {
    label: 'Quick Win',
    titleSuffix: 'in 60 Sekunden',
    hookStyle: 'question',
    stepFocus: ['Hook & Problem', 'Lösung / Demo', 'CTA & Save'],
  },
  {
    label: 'POV Story',
    titleSuffix: '— so hab ich es gemacht',
    hookStyle: 'pov',
    stepFocus: ['Relatable Setup', 'Twist / Ergebnis', 'Kommentar-CTA'],
  },
  {
    label: 'Hot Take',
    titleSuffix: '— was niemand sagt',
    hookStyle: 'contrarian',
    stepFocus: ['Controversial Opening', 'Proof / Beispiel', 'Follow & Diskussion'],
  },
] as const

const CAPTION_HOOKS = [
  'POV:',
  'Real talk:',
  'Save this if',
  'Nobody talks about',
  'Watch till the end:',
  'This changed everything:',
] as const

function normalizeTag(tag: string): string {
  const t = tag.trim().replace(/^#/, '')
  return t ? `#${t}` : ''
}

function parseEngagementPercent(trend: TrendIntelligence): number {
  const raw = trend.engagementRate || trend.engagement || '0'
  const n = parseFloat(raw.replace('%', '').replace(',', '.'))
  return Number.isFinite(n) ? n : 6
}

function pickCta(trend: TrendIntelligence, index: number): string {
  const pool = [
    ...(trend.ctaAngles ?? []),
    trend.contentBreakdown.ctaStrategy,
    'Speichern für später — dann in Kommentaren „PLAN" schreiben',
    'Folge für Teil 2 — Algorithmus belohnt Serien',
    'Kommentiere deine Nische — ich antworte mit einem Hook',
  ].filter(Boolean)
  return pool[index % pool.length] ?? pool[0]!
}

function buildHookLine(
  trend: TrendIntelligence,
  angle: (typeof IDEA_ANGLES)[number],
  rand: () => number,
  ideaIndex: number,
): string {
  const suggestions = trend.hookSuggestions ?? []
  const base = suggestions[ideaIndex] ?? trend.hookAnalysis.hookText
  const niche = trend.niche ? ` (${trend.niche})` : ''
  const eng = parseEngagementPercent(trend)

  if (angle.hookStyle === 'pov') {
    return `„POV: Du entdeckst ${trend.title.slice(0, 48)}${trend.title.length > 48 ? '…' : ''}${niche}"`
  }
  if (angle.hookStyle === 'contrarian') {
    return `„Unpopular opinion: ${trend.title} ist überbewertet — bis du ${eng.toFixed(1).replace('.', ',')}% Engagement siehst."`
  }
  const prefixes = ['Stop scrolling:', 'Warum trendet', '3 Dinge zu']
  const prefix = prefixes[Math.floor(rand() * prefixes.length)]
  const stripped = base.replace(/^[„"]|["„]$/g, '').trim()
  return `„${prefix} ${stripped.slice(0, 64)}${stripped.length > 64 ? '…' : ''}"`
}

function buildSteps(
  trend: TrendIntelligence,
  angle: (typeof IDEA_ANGLES)[number],
  opportunity: number,
): [string, string, string] {
  const platform = trend.platform.toLowerCase()
  const isTikTok = platform.includes('tiktok')
  const format = trend.contentBreakdown.format
  const pacing = trend.contentBreakdown.pacing

  return [
    `${angle.stepFocus[0]}: ${isTikTok ? '0–3s' : '0–2s'} — Text-Overlay + ${trend.hookAnalysis.hookType}. ${format.split('·')[0]?.trim() ?? '9:16 Short'}.`,
    `${angle.stepFocus[1]}: ${pacing}. Zeige ${trend.views} Views / ${trend.engagementRate} Engagement als Social Proof${opportunity >= 70 ? ' — „jetzt einsteigen"' : ''}.`,
    `${angle.stepFocus[2]}: ${trend.contentBreakdown.visualStyle}. CTA passend zu ${trend.platform}.`,
  ]
}

function buildVideoTitle(
  trend: TrendIntelligence,
  angle: (typeof IDEA_ANGLES)[number],
  ideaIndex: number,
): string {
  const ideas = trend.contentIdeas ?? []
  if (ideas[ideaIndex]) {
    const idea = ideas[ideaIndex]
    if (idea.length <= 72) return idea
    return `${idea.slice(0, 69)}…`
  }
  const nicheBit = trend.niche ? `${trend.niche}: ` : ''
  return `${nicheBit}${trend.title} ${angle.titleSuffix}`
}

function buildReadyCaption(trend: TrendIntelligence, rand: () => number): string {
  const platform = trend.platform.toLowerCase()
  const isTikTok = platform.includes('tiktok')
  const hookPrefix = CAPTION_HOOKS[Math.floor(rand() * CAPTION_HOOKS.length)]
  const opportunity = trend.opportunityScore ?? 0
  const eng = parseEngagementPercent(trend)
  const cta = pickCta(trend, 0)
  const insight =
    trend.aiInsight ??
    trend.whyViral ??
    `Trend mit ${trend.views} Views und ${eng.toFixed(1).replace('.', ',')}% Engagement.`

  const lines = [
    `${hookPrefix} ${trend.title}`,
    '',
    insight.length > 160 ? `${insight.slice(0, 157)}…` : insight,
    '',
    `📊 ${trend.views} Views · ${trend.engagementRate} Engagement · Opportunity ${opportunity}/100`,
    trend.niche ? `🎯 Nische: ${trend.niche}` : null,
    '',
    cta,
    '',
    isTikTok
      ? '⬇️ Kommentiere „READY" für den vollen Action Plan'
      : '💾 Speichern & teile in deiner Story — Reels lieben Saves',
  ].filter((line): line is string => line !== null)

  return lines.join('\n')
}

function buildHashtagSet(trend: TrendIntelligence, rand: () => number): string[] {
  const niche = (trend.niche ?? 'creator')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9äöüß]/gi, '')
  const platformTag = trend.platform.toLowerCase().includes('instagram') ? 'reels' : 'fyp'
  const rising = (trend.risingKeywords ?? []).map((k) => normalizeTag(k))
  const base = (trend.hashtags ?? []).map(normalizeTag).filter(Boolean)
  const generated = [
    `#${niche || 'trend'}`,
    `#${niche}tips`,
    `#viral${platformTag}`,
    `#${platformTag}`,
    '#contentcreator',
    '#trendalert',
    '#socialmediatips',
    '#growthhacks',
    `#${niche}trend`,
    '#creatoreconomy',
    '#shortform',
    '#hooktips',
  ].map(normalizeTag)

  const merged = [...new Set([...base, ...rising, ...generated])]
  const target = 8 + Math.floor(rand() * 5)
  while (merged.length < 8) {
    merged.push(`#trend${merged.length + 1}`)
  }
  return merged.slice(0, Math.min(12, target))
}

/** Deterministic creator playbook from trend intelligence signals. */
export function buildCreatorActionPlan(trend: TrendIntelligence): CreatorActionPlan {
  const seed = hashString(`cap::${trend.id}::${trend.title}`)
  const rand = createSeededRandom(seed)
  const opportunity = trend.opportunityScore ?? Math.round(trend.viralScore * 0.85)

  const videoIdeas = IDEA_ANGLES.map((angle, index) => ({
    title: buildVideoTitle(trend, angle, index),
    hook: buildHookLine(trend, angle, rand, index),
    steps: buildSteps(trend, angle, opportunity),
    cta: pickCta(trend, index),
  })) as [CreatorVideoIdea, CreatorVideoIdea, CreatorVideoIdea]

  return {
    videoIdeas,
    caption: buildReadyCaption(trend, rand),
    hashtags: buildHashtagSet(trend, rand),
  }
}
