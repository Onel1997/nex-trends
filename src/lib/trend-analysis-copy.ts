import { TREND_STATE_META } from '@/lib/trend-signals'
import type { TrendIntelligence } from '@/types/trend-intelligence'

export function buildTrendShareUrl(trend: TrendIntelligence): string {
  const url = new URL(window.location.href)
  url.searchParams.set('trend', trend.id)
  return url.toString()
}

export function explainOpportunityScore(trend: TrendIntelligence): string {
  const score = trend.opportunityScore ?? 0
  if (score >= 80) {
    return `Opportunity Score ${score}/100 — starkes Fenster: hoher Momentum bei moderater Konkurrenz. Ideal für schnelle Tests und frühe Creator-Positionierung.`
  }
  if (score >= 60) {
    return `Opportunity Score ${score}/100 — solides Potenzial mit messbarem Upside. Fokus auf differenzierte Hooks und schnelle Iteration.`
  }
  return `Opportunity Score ${score}/100 — noch entwicklungsfähig. Erfolg hängt von starker Differenzierung und präzisem Nischen-Fit ab.`
}

export function explainRiskLevel(trend: TrendIntelligence): string {
  const competition = trend.competitionScore ?? 50
  if (competition >= 75) {
    return 'Risiko: Hoch — viele Creator im selben Format. Erfordert einzigartigen Angle oder stärkere Story-Hooks.'
  }
  if (competition >= 50) {
    return 'Risiko: Mittel — etablierte Patterns, aber noch Platz für frische Varianten mit klarer Zielgruppe.'
  }
  return 'Risiko: Niedrig — unterversorgte Nische mit gutem Reward-to-Effort-Verhältnis für Early Movers.'
}

export function explainSaturation(trend: TrendIntelligence): string {
  const state = trend.trendState
  if (!state) return 'Marktsättigung wird aus Velocity und Viral Score abgeleitet.'
  const meta = TREND_STATE_META[state]
  if (state === 'saturated') {
    return `${meta.label}: Trend ist ausgereizt — hohe Creator-Dichte, abnehmende Reichweiten-Multiplikatoren. Nur mit starkem Twist empfohlen.`
  }
  if (state === 'exploding') {
    return `${meta.label}: Peak-Phase — maximale Sichtbarkeit, aber kurzes Zeitfenster. Schnell handeln.`
  }
  if (state === 'rising') {
    return `${meta.label}: Wachstumsphase — algorithmus-freundlich, noch Luft für neue Creator.`
  }
  return `${meta.label}: Konstante Performance — gut für Evergreen-Content und A/B-Tests.`
}

export function buildHookBreakdown(trend: TrendIntelligence) {
  return {
    emotionalTrigger: trend.hookAnalysis.whyItWorks,
    retentionType: trend.hookAnalysis.retentionTrigger,
    whyItWorks: trend.hookAnalysis.whyItWorks,
    ctaPsychology: trend.contentBreakdown.ctaStrategy,
    hookType: trend.hookAnalysis.hookType,
    hookScore: trend.hookAnalysis.hookScore,
  }
}

export function buildAnalysisSummary(trend: TrendIntelligence) {
  const platform = trend.platform.toLowerCase()
  const platformFit =
    platform.includes('tiktok')
      ? 'TikTok: Kurze Hooks, schnelle Cuts und Audio-Trends maximieren Reichweite. Ideal für authentischen UGC-Stil.'
      : platform.includes('instagram') || platform.includes('reels')
        ? 'Instagram Reels: Visuell polierte Openings und klare Text-Overlays performen am besten. Speichern & Shares sind starke Signale.'
        : `${trend.platform}: Format an native Short-Video-Patterns der Plattform anpassen für maximale Discovery.`

  return {
    summary: trend.description || trend.aiInsight || trend.title,
    whyTrending: trend.whyViral ?? trend.engagementPrediction,
    opportunity: explainOpportunityScore(trend),
    hookStrategies: trend.hookSuggestions?.length
      ? trend.hookSuggestions
      : [trend.hookAnalysis.hookText],
    bestPostTimes: trend.contentBreakdown.bestPostTime,
    ctaRecommendations: trend.ctaAngles ?? [trend.contentBreakdown.ctaStrategy],
    riskLevel: explainRiskLevel(trend),
    saturation: explainSaturation(trend),
    contentIdeas: trend.contentIdeas,
    platformFit,
    audiencePsychology:
      trend.targetAudience ??
      trend.engagementPrediction ??
      'Zielgruppe reagiert auf klare Value-Proposition in den ersten 2 Sekunden.',
    hashtags: trend.hashtags,
    viralScore: trend.viralScore,
    engagementRate: trend.engagementRate,
    competitionScore: trend.competitionScore,
    contentStrategy: `${trend.contentBreakdown.format} · ${trend.contentBreakdown.pacing} · ${trend.contentBreakdown.visualStyle}`,
  }
}
