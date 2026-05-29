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

function delay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractTopic(input: string): string {
  const trimmed = input.trim()
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed || 'dein Produkt'
}

export async function generateAdCopyPlaceholder(briefing: string): Promise<string> {
  await delay()
  const topic = extractTopic(briefing)

  return `━━ AI AD COPY · ${topic.toUpperCase()} ━━

▸ HEADLINE 1
„${topic} — endlich ohne Bullshit-Marketing."

▸ HEADLINE 2
„Die ${topic}-Methode, die Creators gerade testen (und nicht mehr loslassen)."

▸ HEADLINE 3
„Warum 80 % bei ${topic} Geld verbrennen — und was die Top 1 % anders machen."

▸ PRIMARY CTA
Jetzt kostenlos testen → Link in Bio

▸ SECONDARY CTA
Speichern & später umsetzen

▸ SHORT-FORM BODY (TikTok/Reels)
Hook: „Stopp — wenn du ${topic} machst, musst du das sehen."
Body: 3 schnelle Wins + Social Proof
CTA: „Kommentiere ‚GO' für die Checkliste."

▸ STORY ANGLE
Authentisch, mobile-first, kein Corporate-Speak — UGC-Look mit Text-Overlay.`
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

export async function generateSeoTitlesPlaceholder(briefing: string): Promise<string> {
  await delay()
  const topic = extractTopic(briefing)

  return `━━ SEO TITLES · CTR-OPTIMIERT ━━

1. ${topic}: Der komplette Guide (2026)
   └ 52 Zeichen · Intent: Informational

2. ${topic} — 7 Strategien, die wirklich funktionieren
   └ 48 Zeichen · Intent: How-to

3. Warum ${topic} gerade explodiert (Daten & Trends)
   └ 47 Zeichen · Intent: Trend / News

4. ${topic} für Anfänger: Von 0 auf 10K in 90 Tagen
   └ 49 Zeichen · Intent: Beginner

5. ${topic} vs. Alternativen: Ehrlicher Vergleich
   └ 44 Zeichen · Intent: Commercial

Tipps: Zahl + Jahr + Klarheit erhöhen CTR um ~15–25 % in SERP-Tests.`
}
