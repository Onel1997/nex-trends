import type { ScoutedTrendRaw, TrendIntelligence, TrendVelocity } from '@/types/trend-intelligence'

const CARD_GRADIENTS = [
  { from: 'from-violet-600', to: 'to-fuchsia-600' },
  { from: 'from-indigo-500', to: 'to-purple-600' },
  { from: 'from-cyan-500', to: 'to-blue-600' },
  { from: 'from-rose-500', to: 'to-orange-600' },
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
  return items.length > 0 ? items.slice(0, 4) : fallback
}

export function mapRawToTrendIntelligence(
  raw: ScoutedTrendRaw,
  index: number,
  idPrefix = 'trend',
): TrendIntelligence {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const platform = raw.platform?.trim() || 'TikTok'
  const title = raw.title?.trim() || 'Viraler Trend'
  const hashtags = ensureStringArray(raw.hashtags, [`#${title.split(' ')[0]?.toLowerCase() || 'trend'}`])

  return {
    id: `${idPrefix}-${index}`,
    title,
    platform,
    views: raw.views?.trim() || '1.2M',
    engagement: raw.engagement?.trim() || '8.2%',
    description:
      raw.description?.trim() ||
      'Hohes Re-Share-Potenzial durch starke Hook-Struktur und plattformgerechtes Format.',
    gradientFrom: gradient.from,
    gradientTo: gradient.to,
    viralScore: clampScore(typeof raw.viralScore === 'number' ? raw.viralScore : 72 + index * 4),
    trendVelocity: normalizeVelocity(raw.trendVelocity),
    hashtags,
    engagementPrediction:
      raw.engagementPrediction?.trim() ||
      `Erwartete Engagement-Rate ${raw.engagement?.trim() || '7–9 %'} in den nächsten 48h.`,
    contentIdeas: ensureStringArray(raw.contentIdeas, [
      `3-Clip-Serie zum Thema „${title.slice(0, 40)}“ mit starker Hook in Sekunde 1.`,
    ]),
    hookSuggestions: ensureStringArray(raw.hookSuggestions, [
      `„Wenn du ${hashtags[0]?.replace('#', '') || 'diesen Trend'} ignorierst, verpasst du 80 % Reichweite.“`,
    ]),
    creatorInspiration:
      raw.creatorInspiration?.trim() ||
      `Creator im ${platform}-Format: schnelle Jump-Cuts, Text-Overlay, authentischer Voice-over.`,
    niche: raw.niche?.trim(),
    isDemo: false,
  }
}

export const DEMO_TREND_INTELLIGENCE: TrendIntelligence[] = [
  {
    id: 'demo-1',
    title: 'POV: Du optimierst deinen Morgen in 60 Sekunden',
    platform: 'TikTok',
    views: '2.4M',
    engagement: '9.8%',
    description:
      'Kurze POV-Clips mit Before/After-Hook. Hohe Watch-Time durch schnelle Schnitte und relatable Alltagsszenen.',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-fuchsia-600',
    viralScore: 91,
    trendVelocity: 'rising',
    hashtags: ['#morningroutine', '#productivity', '#pov'],
    engagementPrediction: '9.2–11.5 % Engagement in den nächsten 72h bei konsistentem Posting.',
    contentIdeas: [
      '„60-Sekunden Morning Stack“ — 3 Quick-Wins mit Text-Overlay.',
      'Duet-Format: Reaktion auf Top-Creator in der Nische.',
    ],
    hookSuggestions: [
      '„Ich hab 30 Tage diese Morgen-Routine getestet — das Ergebnis ist wild.“',
      '„POV: Du wachst endlich ohne Snooze auf.“',
    ],
    creatorInspiration: '@productivity.tok · Jump-Cuts, Front-Cam, lo-fi Beat',
    niche: 'Productivity',
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'Quiet Luxury Capsule — 5 Looks, 1 Woche',
    platform: 'Instagram',
    views: '1.1M',
    engagement: '7.2%',
    description:
      'Ästhetische Carousel + Reel-Kombi. Save-Rate hoch durch minimalistische Farbpalette und Outfit-Listen.',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-orange-600',
    viralScore: 84,
    trendVelocity: 'peak',
    hashtags: ['#quietluxury', '#capsulewardrobe', '#reels'],
    engagementPrediction: '6.8–8.1 % — starke Save-Rate, moderate Comment-Spikes.',
    contentIdeas: [
      'Carousel: 5 Looks mit Preis-Range und Shop-Links.',
      'Reel: 7-Sekunden Transition zwischen Looks.',
    ],
    hookSuggestions: [
      '„5 Outfits, 1 Woche — ohne neuen Kauf.“',
    ],
    creatorInspiration: '@stylecapsule · Soft lighting, neutral tones, slow zoom',
    niche: 'Fashion',
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'Dieser Skincare-Hack wird gerade überall kopiert',
    platform: 'TikTok',
    views: '3.8M',
    engagement: '11.4%',
    description:
      'Problem-Solution-Format mit Dermatology-ähnlichem Authority-Hook. Hohe Share-Rate in Gen Z.',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
    viralScore: 94,
    trendVelocity: 'rising',
    hashtags: ['#skintok', '#skincare', '#beautyhacks'],
    engagementPrediction: '10.5–12.8 % — hohes Share- und Comment-Volumen erwartet.',
    contentIdeas: [
      '„3 Schritte, 1 Produkt“ — Myth-Busting Opener.',
      'Before/After mit Disclaimer und 7-Tage-Tracker.',
    ],
    hookSuggestions: [
      '„Dermatologen hassen diesen Trick — ich zeig dir warum.“',
    ],
    creatorInspiration: '@skintok · Close-up, ring light, science-style captions',
    niche: 'Beauty',
    isDemo: true,
  },
  {
    id: 'demo-4',
    title: 'Side Hustle ohne Startkapital — so geht’s',
    platform: 'TikTok',
    views: '1.9M',
    engagement: '8.9%',
    description:
      'Listicle-Format mit konkreten Zahlen. CTA zu Link-in-Bio performt stark bei Business-Nischen.',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-600',
    viralScore: 88,
    trendVelocity: 'stable',
    hashtags: ['#sidehustle', '#makemoneyonline', '#entrepreneur'],
    engagementPrediction: '8.0–9.5 % — hohe Watch-Time bei 45–60s Videos.',
    contentIdeas: [
      '„3 Side Hustles unter 50 € Start“ mit Screen-Recording.',
      'Storytime: Erster 1.000-€-Monat in 90 Tagen.',
    ],
    hookSuggestions: [
      '„Ich hab mit 0 € gestartet — das ist mein erster Verdienst.“',
    ],
    creatorInspiration: '@hustlelab · Screen cap + face cam split, bold subtitles',
    niche: 'Business',
    isDemo: true,
  },
]

export const VELOCITY_META: Record<
  TrendVelocity,
  { label: string; className: string }
> = {
  rising: { label: 'Steigend', className: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/25' },
  peak: { label: 'Peak', className: 'text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/25' },
  stable: { label: 'Stabil', className: 'text-zinc-300 bg-zinc-500/10 ring-zinc-500/25' },
  cooling: { label: 'Abkühlend', className: 'text-amber-300 bg-amber-500/10 ring-amber-500/25' },
}

export function getViralScoreTone(score: number): {
  label: string
  ringClass: string
  textClass: string
} {
  if (score >= 90) {
    return {
      label: 'Sehr hoch',
      ringClass: 'stroke-emerald-400',
      textClass: 'text-emerald-400',
    }
  }
  if (score >= 75) {
    return {
      label: 'Hoch',
      ringClass: 'stroke-violet-400',
      textClass: 'text-violet-400',
    }
  }
  if (score >= 60) {
    return {
      label: 'Mittel',
      ringClass: 'stroke-amber-400',
      textClass: 'text-amber-400',
    }
  }
  return {
    label: 'Moderat',
    ringClass: 'stroke-zinc-500',
    textClass: 'text-zinc-400',
  }
}

export { CARD_GRADIENTS }
