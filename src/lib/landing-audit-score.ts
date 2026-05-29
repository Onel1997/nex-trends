/** CRO audit score visual tiers — distinct from viral trend scoring */

export type CroScoreTier = 'critical' | 'warning' | 'good' | 'premium'

export type CroScoreTone = {
  tier: CroScoreTier
  label: string
  textClass: string
  bgClass: string
  ringClass: string
  barClass: string
  glowClass: string
}

export function getCroScoreTone(score: number): CroScoreTone {
  if (score >= 85) {
    return {
      tier: 'premium',
      label: 'Premium',
      textClass: 'text-violet-300',
      bgClass: 'bg-violet-500/12',
      ringClass: 'ring-violet-400/45',
      barClass: 'from-violet-500 via-fuchsia-500 to-violet-400',
      glowClass: 'lp-score-glow--premium',
    }
  }
  if (score >= 70) {
    return {
      tier: 'good',
      label: 'Strong',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      ringClass: 'ring-emerald-500/35',
      barClass: 'from-emerald-600 to-emerald-400',
      glowClass: 'lp-score-glow--good',
    }
  }
  if (score >= 50) {
    return {
      tier: 'warning',
      label: 'Needs work',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      ringClass: 'ring-amber-500/30',
      barClass: 'from-amber-600 to-amber-400',
      glowClass: '',
    }
  }
  return {
    tier: 'critical',
    label: 'Critical',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
    ringClass: 'ring-red-500/30',
    barClass: 'from-red-600 to-red-400',
    glowClass: '',
  }
}
