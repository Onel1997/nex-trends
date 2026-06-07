/** Placeholder AI responses — swap for OpenAI when API keys are configured */

export type {
  LandingAuditCategory,
  LandingAuditResult,
  LandingInputKind,
  BusinessType,
} from '@/lib/landing-page-analyzer'

export {
  analyzeLandingPagePlaceholder,
  analyzeLandingPageContent,
} from '@/lib/landing-page-analyzer'

import type { AdCopyPlatform, AdCopyTone, AdCopyVariant } from '@/types/ad-copy-generation'
import type { SeoTitleGenerationRequest, SeoTitleVariant } from '@/types/seo-title-generation'

function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractTopic(input: string): string {
  const trimmed = input.trim()
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed || 'dein Produkt'
}

export async function generateAdCopyVariantsPlaceholder(
  briefing: string,
  tone: AdCopyTone = 'aggressive',
  platform: AdCopyPlatform = 'Meta Ads',
): Promise<AdCopyVariant[]> {
  await delay()
  const topic = extractTopic(briefing)
  const toneHint = tone === 'luxury' ? 'Premium' : tone === 'ugc' ? 'Authentisch' : 'Direkt'

  return [
    {
      headline: `${topic} — endlich ohne Bullshit-Marketing.`,
      primaryText: `${toneHint} Ad Copy für ${platform}: Zeige deiner Zielgruppe in 3 Sekunden, warum ${topic} jetzt relevant ist. Social Proof + klare Value Prop.`,
      cta: 'Jetzt kostenlos testen',
    },
    {
      headline: `Die ${topic}-Methode, die Creators testen.`,
      primaryText: `POV: Du entdeckst ${topic} zum ersten Mal. 3 schnelle Wins, die sofort umsetzbar sind — ohne teures Setup. Perfekt für ${platform}.`,
      cta: 'Mehr erfahren',
    },
    {
      headline: `Warum 80 % bei ${topic} Geld verbrennen.`,
      primaryText: `Die Top 1 % machen es anders: Fokus auf Ergebnis statt Hype. ${toneHint} Messaging, das konvertiert — optimiert für Paid Social.`,
      cta: 'Strategie sichern',
    },
    {
      headline: `Stopp — ${topic} ohne diese 3 Fehler.`,
      primaryText: `Die häufigsten Paid-Ad-Fehler bei ${topic} — und wie du sie in 24h fixst. Mobile-first, scroll-stoppend, conversion-stark.`,
      cta: 'Checkliste holen',
    },
    {
      headline: `${topic}: Von 0 auf Ergebnis in 14 Tagen.`,
      primaryText: `Authentisch, mobile-first, kein Corporate-Speak. UGC-Look mit Text-Overlay — ideal für ${platform} und schnelle Tests.`,
      cta: 'Jetzt starten',
    },
  ]
}

/** @deprecated Use generateAdCopyVariantsPlaceholder — kept for legacy AiGeneratorTool */
export async function generateAdCopyPlaceholder(briefing: string): Promise<string> {
  const variants = await generateAdCopyVariantsPlaceholder(briefing)
  return variants
    .map(
      (v, i) =>
        `▸ VARIANTE ${i + 1}\nHeadline: ${v.headline}\n\n${v.primaryText}\n\nCTA: ${v.cta}`,
    )
    .join('\n\n')
}

export async function generateHooksPlaceholder(briefing: string): Promise<string> {
  await delay()
  const topic = extractTopic(briefing)

  return `━━ HOOKS · SCROLL-STOPPER ━━

1. „Stopp — wenn du ${topic} ignorierst, verlierst du die nächsten 30 Tage."

2. „Ich hab ${topic} 14 Tage getestet. Das Ergebnis ist nicht, was du denkst."

3. „POV: Du entdeckst ${topic} zum ersten Mal — und alles ändert sich."

4. „Die ${topic}-Lüge, die dir niemand erzählt (und wie du sie nutzt)."

5. „3 Sekunden. Ein Satz. ${topic} — so einfach war es noch nie."`
}

export async function generateSeoTitleVariantsPlaceholder(
  request: SeoTitleGenerationRequest,
): Promise<SeoTitleVariant[]> {
  await delay()
  const topic = extractTopic(request.briefing)
  const keyword = request.keyword?.trim() || topic
  const year = new Date().getFullYear()

  const templates: SeoTitleVariant[] = [
    {
      title: `${topic}: Der komplette Guide (${year})`,
      seoScore: 88,
      ctrScore: 84,
      readabilityScore: 91,
      keyword,
      searchIntent: 'informational',
    },
    {
      title: `${topic} — 7 Strategien, die wirklich funktionieren`,
      seoScore: 85,
      ctrScore: 86,
      readabilityScore: 88,
      keyword,
      searchIntent: 'informational',
    },
    {
      title: `Warum ${topic} gerade explodiert (Daten & Trends)`,
      seoScore: 82,
      ctrScore: 89,
      readabilityScore: 85,
      keyword,
      searchIntent: 'commercial',
    },
    {
      title: `${topic} für Anfänger: Von 0 auf Ergebnis in 90 Tagen`,
      seoScore: 86,
      ctrScore: 83,
      readabilityScore: 90,
      keyword,
      searchIntent: 'transactional',
    },
    {
      title: `${topic} vs. Alternativen: Ehrlicher Vergleich ${year}`,
      seoScore: 84,
      ctrScore: 87,
      readabilityScore: 86,
      keyword,
      searchIntent: 'commercial',
    },
  ]

  return templates.map((t) => ({
    ...t,
    title: t.title.slice(0, 70),
  }))
}

/** @deprecated Use generateSeoTitleVariantsPlaceholder */
export async function generateSeoTitlesPlaceholder(briefing: string): Promise<string> {
  const variants = await generateSeoTitleVariantsPlaceholder({
    briefing,
    platform: 'Google Search',
  })
  return variants
    .map(
      (v, i) =>
        `${i + 1}. ${v.title}\n   └ ${v.title.length} Zeichen · SEO ${v.seoScore} · CTR ${v.ctrScore}`,
    )
    .join('\n\n')
}
