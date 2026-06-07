/**
 * Semi-dynamic CRO audit engine for Phase 1 (text/URL heuristics, no DOM scrape).
 */

export type LandingInputKind = 'url' | 'text' | 'mixed'

export type BusinessType =
  | 'saas'
  | 'ecommerce'
  | 'local'
  | 'service'
  | 'agency'
  | 'creator'
  | 'portfolio'
  | 'unknown'

export type LandingAuditCategory = {
  name: string
  score: number
  note: string
}

export type LandingAuditResult = {
  overallScore: number
  inputKind: LandingInputKind
  businessType: BusinessType
  businessLabel: string
  detectedNiche: string
  domainHint: string | null
  categories: LandingAuditCategory[]
  strengths: string[]
  improvements: string[]
  quickWins: string[]
}

type PageSignals = {
  inputKind: LandingInputKind
  raw: string
  url: string | null
  domain: string | null
  pathKeywords: string[]
  content: string
  wordCount: number
  businessType: BusinessType
  businessLabel: string
  niche: string
  hasCta: boolean
  detectedCtas: string[]
  hasPricing: boolean
  hasFreeTrial: boolean
  hasSignupFlow: boolean
  hasBookingContact: boolean
  hasEcommerceSignals: boolean
  hasTrustSignals: boolean
  hasTestimonials: boolean
  hasLogos: boolean
  hasFaq: boolean
  hasGuarantee: boolean
  hasClearHeadline: boolean
  hasSingleFocus: boolean
  hasMobileHints: boolean
  hasStickyCtaMention: boolean
  hasSocialProof: boolean
  hasOfferSpecificity: boolean
  hasConversionStructure: boolean
}

const URL_RE = /https?:\/\/[^\s]+/gi

const CTA_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(jetzt\s+)?(kostenlos\s+)?(starten|loslegen|registrieren)\b/i, label: 'Start / Registrierung' },
  { pattern: /\b(kostenlos\s+testen|free\s+trial|trial\s+starten)\b/i, label: 'Trial' },
  { pattern: /\b(demo\s+buchen|demo\s+anfordern|live\s+demo)\b/i, label: 'Demo' },
  { pattern: /\b(jetzt\s+)?kaufen\b|\badd\s+to\s+cart\b|\bin\s+den\s+warenkorb\b/i, label: 'Kauf' },
  { pattern: /\b(termin|buchung|reservier)\b/i, label: 'Buchung' },
  { pattern: /\b(kontakt|anfrage\s+senden|angebot\s+anfordern)\b/i, label: 'Kontakt' },
  { pattern: /\b(newsletter|abonnieren|subscribe)\b/i, label: 'Newsletter' },
  { pattern: /\b(download|herunterladen|app\s+laden)\b/i, label: 'Download' },
  { pattern: /\b(get\s+started|sign\s+up|join\s+now)\b/i, label: 'Sign-up (EN)' },
  { pattern: /\b(mehr\s+erfahren|learn\s+more)\b/i, label: 'Mehr erfahren' },
]

const BUSINESS_RULES: {
  type: BusinessType
  label: string
  patterns: RegExp[]
  domainHints?: RegExp[]
}[] = [
  {
    type: 'ecommerce',
    label: 'E-Commerce / Shop',
    patterns: [
      /\b(shop|store|warenkorb|cart|checkout|produkt|kollektion|versand|größen|sku)\b/i,
      /\b(kaufen|bestellen|sale|rabatt|%\s*off)\b/i,
    ],
    domainHints: [/shop\b/i, /store\b/i, /cart\b/i],
  },
  {
    type: 'saas',
    label: 'SaaS / Software',
    patterns: [
      /\b(saas|software|plattform|dashboard|api|integration|onboarding)\b/i,
      /\b(pricing|preise|pläne|plans|per\s+month|\/mo|nutzer)\b/i,
      /\b(free\s+trial|kostenlos\s+testen|enterprise)\b/i,
    ],
    domainHints: [/app\b/i, /cloud\b/i, /io\b/i],
  },
  {
    type: 'local',
    label: 'Lokales Geschäft',
    patterns: [
      /\b(öffnungszeiten|standort|adresse|anfahrt|filiale|restaurant|café|barber|salon)\b/i,
      /\b(termin\s+vereinbaren|reservierung|lieferservice|lieferung)\b/i,
    ],
  },
  {
    type: 'agency',
    label: 'Agentur',
    patterns: [
      /\b(agentur|agency|mandant|kunden|case\s*stud(y|ies)|referenzen)\b/i,
      /\b(leistungen|services|portfolio\s+anfrage)\b/i,
    ],
    domainHints: [/agency\b/i, /agentur\b/i],
  },
  {
    type: 'creator',
    label: 'Creator / Personal Brand',
    patterns: [
      /\b(creator|influencer|youtube|tiktok|instagram|podcast|newsletter)\b/i,
      /\b(follower|community|kurs|masterclass|coaching)\b/i,
    ],
  },
  {
    type: 'portfolio',
    label: 'Portfolio',
    patterns: [
      /\b(portfolio|projekte|arbeiten|selected\s+work|showcase)\b/i,
      /\b(designer|fotograf|entwickler|freelancer)\b/i,
    ],
  },
  {
    type: 'service',
    label: 'Dienstleistung',
    patterns: [
      /\b(beratung|consulting|coaching|dienstleistung|service|angebot)\b/i,
      /\b(unverbindlich|erstgespräch|kostenlose\s+beratung)\b/i,
    ],
  },
]

const NICHE_KEYWORDS: Record<string, string[]> = {
  fitness: ['fitness', 'gym', 'workout', 'training', 'yoga'],
  beauty: ['beauty', 'kosmetik', 'skincare', 'makeup', 'salon'],
  finance: ['finance', 'invest', 'crypto', 'trading', 'bank'],
  food: ['food', 'restaurant', 'recipe', 'kitchen', 'catering'],
  tech: ['tech', 'ai', 'software', 'digital', 'automation'],
  education: ['course', 'learn', 'academy', 'schule', 'training'],
  health: ['health', 'medical', 'therapy', 'wellness', 'clinic'],
  realestate: ['immobilien', 'real estate', 'property', 'wohnung'],
  marketing: ['marketing', 'ads', 'seo', 'growth', 'brand'],
}

function delay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractUrls(raw: string): string[] {
  return [...raw.matchAll(URL_RE)].map((m) => m[0].replace(/[),.;]+$/, ''))
}

function parseDomain(url: string): { domain: string; pathKeywords: string[] } | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    const host = parsed.hostname.replace(/^www\./, '')
    const hostParts = host.split(/[.-]/).filter((p) => p.length > 2 && !['com', 'de', 'io', 'co', 'app', 'net', 'org'].includes(p))
    const pathParts = parsed.pathname
      .split(/[/\-_]+/)
      .filter((p) => p.length > 2 && !/^\d+$/.test(p))
    return { domain: host, pathKeywords: [...hostParts, ...pathParts] }
  } catch {
    return null
  }
}

function classifyInput(raw: string): LandingInputKind {
  const urls = extractUrls(raw)
  const withoutUrls = raw.replace(URL_RE, ' ').trim()
  const textWords = withoutUrls.split(/\s+/).filter(Boolean).length
  if (urls.length > 0 && textWords >= 25) return 'mixed'
  if (urls.length > 0) return 'url'
  return 'text'
}

function detectCtas(text: string): { has: boolean; labels: string[] } {
  const labels: string[] = []
  for (const { pattern, label } of CTA_PATTERNS) {
    if (pattern.test(text) && !labels.includes(label)) labels.push(label)
  }
  return { has: labels.length > 0, labels }
}

function scoreBusinessType(
  text: string,
  domain: string | null,
  pathKeywords: string[],
): { type: BusinessType; label: string; score: number } {
  const haystack = `${text} ${domain ?? ''} ${pathKeywords.join(' ')}`.toLowerCase()
  let best: { type: BusinessType; label: string; score: number } = {
    type: 'unknown',
    label: 'Allgemeine Landing Page',
    score: 0,
  }

  for (const rule of BUSINESS_RULES) {
    let score = 0
    for (const p of rule.patterns) {
      if (p.test(haystack)) score += 2
    }
    for (const d of rule.domainHints ?? []) {
      if (domain && d.test(domain)) score += 3
    }
    for (const kw of pathKeywords) {
      for (const p of rule.patterns) {
        if (p.test(kw)) score += 1
      }
    }
    if (score > best.score) {
      best = { type: rule.type, label: rule.label, score }
    }
  }

  return best
}

function inferNiche(text: string, keywords: string[]): string {
  const haystack = `${text} ${keywords.join(' ')}`.toLowerCase()
  for (const [niche, terms] of Object.entries(NICHE_KEYWORDS)) {
    if (terms.some((t) => haystack.includes(t))) {
      return niche.charAt(0).toUpperCase() + niche.slice(1)
    }
  }
  const significant = keywords.filter((k) => k.length > 3).slice(0, 2)
  if (significant.length > 0) {
    return significant.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(' · ')
  }
  return 'Allgemein'
}

function analyzeSignals(raw: string): PageSignals {
  const inputKind = classifyInput(raw)
  const urls = extractUrls(raw)
  const primaryUrl = urls[0] ?? null
  const parsed = primaryUrl ? parseDomain(primaryUrl) : null
  const domain = parsed?.domain ?? null
  const pathKeywords = parsed?.pathKeywords ?? []
  const content = raw.replace(URL_RE, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const textLower = `${content} ${domain ?? ''} ${pathKeywords.join(' ')}`.toLowerCase()

  const { type: businessType, label: businessLabel } = scoreBusinessType(
    content,
    domain,
    pathKeywords,
  )
  const niche = inferNiche(content, pathKeywords)
  const { has: hasCta, labels: detectedCtas } = detectCtas(textLower)

  const hasPricing =
    /\b(preis|pricing|€|\$|\/monat|pro monat|ab\s+\d|plans?|paket)\b/i.test(textLower)
  const hasFreeTrial = /\b(kostenlos\s+testen|free\s+trial|trial|ohne\s+kreditkarte)\b/i.test(
    textLower,
  )
  const hasSignupFlow =
    /\b(registrier|sign\s*up|account\s+erstellen|login|anmelden)\b/i.test(textLower)
  const hasBookingContact =
    /\b(termin|buchen|kontakt|anfrage|beratung|erstgespräch|whatsapp)\b/i.test(textLower)
  const hasEcommerceSignals =
    businessType === 'ecommerce' ||
    /\b(warenkorb|checkout|produkt|shop|kaufen)\b/i.test(textLower)

  const hasTrustSignals =
    /\b(bewertung|review|testimonial|kunden|trust|sicher|ssl|garantie|zufrieden)\b/i.test(
      textLower,
    )
  const hasTestimonials =
    /\b(testimonial|kundenstimme|„|"|sterne|★|trustpilot|google\s+bewertung)\b/i.test(textLower)
  const hasLogos = /\b(logo|partner|kunden|as\s+seen|vertrauen)\b/i.test(textLower)
  const hasFaq = /\b(faq|häufige\s+fragen|fragen\s+und\s+antworten)\b/i.test(textLower)
  const hasGuarantee = /\b(garantie|geld\s+zurück|risk.?free|ohne\s+risiko)\b/i.test(textLower)

  const hasClearHeadline =
    wordCount >= 12 &&
    (/\b(wir|dein|ihr|die\s+\w+\s+lösung|#1|führend)\b/i.test(content.slice(0, 400)) ||
      content.split(/[.!?]/)[0]?.length > 20)

  const ctaCount = detectedCtas.length
  const hasSingleFocus = ctaCount <= 2 && wordCount > 0

  const hasMobileHints =
    /\b(mobile|responsive|app|ios|android|thumb)\b/i.test(textLower) || wordCount < 800

  const hasStickyCtaMention = /\b(sticky|fixiert|floating)\b/i.test(textLower)

  const hasSocialProof = hasTestimonials || hasLogos || hasTrustSignals

  const hasOfferSpecificity =
    /\b(\d+\s*%|\d+\s+tage|in\s+\d+\s+min|garantie|bonus|inkl\.|ohne\s+vertrag)\b/i.test(
      textLower,
    ) || hasPricing

  const hasConversionStructure =
    (hasClearHeadline && (hasCta || hasBookingContact)) ||
    (hasFaq && hasSocialProof) ||
    wordCount >= 80

  return {
    inputKind,
    raw,
    url: primaryUrl,
    domain,
    pathKeywords,
    content,
    wordCount,
    businessType,
    businessLabel,
    niche,
    hasCta,
    detectedCtas,
    hasPricing,
    hasFreeTrial,
    hasSignupFlow,
    hasBookingContact,
    hasEcommerceSignals,
    hasTrustSignals,
    hasTestimonials,
    hasLogos,
    hasFaq,
    hasGuarantee,
    hasClearHeadline,
    hasSingleFocus,
    hasMobileHints,
    hasStickyCtaMention,
    hasSocialProof,
    hasOfferSpecificity,
    hasConversionStructure,
  }
}

function clampScore(n: number): number {
  return Math.max(28, Math.min(96, Math.round(n)))
}

function computeCategoryScores(s: PageSignals): LandingAuditCategory[] {
  let clarity = 52
  if (s.hasClearHeadline) clarity += 18
  if (s.wordCount >= 40) clarity += 8
  if (s.wordCount >= 120) clarity += 6
  if (s.niche !== 'Allgemein') clarity += 5
  if (s.inputKind === 'url' && s.wordCount < 15) clarity -= 12

  let cta = 45
  if (s.hasCta) cta += 22
  if (s.hasSingleFocus) cta += 10
  if (!s.hasCta) cta -= 8
  if (s.detectedCtas.length > 3) cta -= 12

  let trust = 48
  if (s.hasSocialProof) trust += 20
  if (s.hasTestimonials) trust += 8
  if (s.hasLogos) trust += 6
  if (s.hasGuarantee) trust += 8
  if (s.businessType === 'ecommerce' && !s.hasTrustSignals) trust -= 10

  let mobileUx = 55
  if (s.hasMobileHints) mobileUx += 10
  if (s.hasStickyCtaMention) mobileUx += 8
  if (s.hasCta) mobileUx += 6
  if (s.wordCount > 1200) mobileUx -= 10
  if (s.detectedCtas.length > 2) mobileUx -= 6

  let offerStrength = 50
  if (s.hasOfferSpecificity) offerStrength += 16
  if (s.hasPricing) offerStrength += 10
  if (s.hasFreeTrial && s.businessType === 'saas') offerStrength += 8
  if (s.hasGuarantee) offerStrength += 6
  if (!s.hasOfferSpecificity && s.wordCount > 50) offerStrength -= 8

  let conversionStructure = 50
  if (s.hasConversionStructure) conversionStructure += 18
  if (s.hasFaq) conversionStructure += 10
  if (s.hasCta && s.hasSocialProof) conversionStructure += 8
  if (!s.hasCta && !s.hasBookingContact) conversionStructure -= 15

  const notes = buildCategoryNotes(s)

  return [
    { name: 'Clarity', score: clampScore(clarity), note: notes.clarity },
    { name: 'CTA', score: clampScore(cta), note: notes.cta },
    { name: 'Trust', score: clampScore(trust), note: notes.trust },
    { name: 'Mobile UX', score: clampScore(mobileUx), note: notes.mobile },
    { name: 'Offer strength', score: clampScore(offerStrength), note: notes.offer },
    { name: 'Conversion structure', score: clampScore(conversionStructure), note: notes.structure },
  ]
}

function buildCategoryNotes(s: PageSignals): Record<string, string> {
  const clarity =
    s.wordCount < 20 && s.inputKind !== 'text'
      ? 'Nur URL erkannt — mehr Seitentext liefert genauere Klarheits-Bewertung.'
      : s.hasClearHeadline
        ? `Value Proposition für „${s.niche}" erkennbar — Hero auf ein Outcome schärfen.`
        : 'Headline/Subheadline nicht klar erkennbar — Nutzen in den ersten 2 Zeilen formulieren.'

  const cta = s.hasCta
    ? `Erkannte Aktionen: ${s.detectedCtas.join(', ')}. ${s.detectedCtas.length > 2 ? 'Zu viele konkurrierende CTAs.' : 'Fokus auf eine Primäraktion halten.'}`
    : 'Kein klarer CTA im Text/URL-Kontext — eine dominante Handlungsaufforderung above-the-fold ergänzen.'

  const trust = s.hasSocialProof
    ? 'Trust-Signale vorhanden — näher am Hero platzieren für schnellere Glaubwürdigkeit.'
    : s.businessType === 'ecommerce'
      ? 'Für Shops fehlen sichtbare Trust-Elemente (Bewertungen, Zahlungsicons, Versandinfo).'
      : 'Social Proof (Logos, Bewertungen, Zahlen) fehlt oder ist nicht erkennbar.'

  const mobile =
    s.wordCount > 1200
      ? 'Viel Copy — auf Mobile kürzen, Sticky-CTA und kurze Absätze prüfen.'
      : s.hasStickyCtaMention
        ? 'Mobile-Sticky-CTA erwähnt — Kontrast und Thumb-Zone validieren.'
        : 'Thumb-Zone & Scroll-Länge auf Mobile testen (Sticky-CTA empfohlen).'

  const offer = s.hasOfferSpecificity
    ? s.hasPricing
      ? 'Angebot/Preis erkennbar — Nutzen vs. Preis klarer koppeln.'
      : 'Konkrete Benefits erkannt — Zahlen, Deadline oder Bonus ergänzen.'
    : 'Angebot wirkt unspezifisch — Outcome, Zeitrahmen oder Risiko-Umkehr benennen.'

  const structure = s.hasFaq
    ? 'FAQ/Struktur erkennbar — CTA vor dem Fold und nach Social Proof wiederholen.'
    : s.hasConversionStructure
      ? 'Grundstruktur vorhanden — Einwände (FAQ) und Proof-Block ergänzen.'
      : 'Klassische Conversion-Sequenz fehlt: Problem → Lösung → Proof → CTA.'

  return { clarity, cta, trust, mobile, offer, structure }
}

function buildStrengths(s: PageSignals): string[] {
  const items: string[] = []

  if (s.hasClearHeadline) {
    items.push(`Erkennbare Positionierung im ${s.businessLabel}-Kontext (${s.niche}).`)
  }
  if (s.hasCta) {
    items.push(`Handlungsaufforderung erkannt: ${s.detectedCtas.slice(0, 2).join(', ')}.`)
  }
  if (s.hasSocialProof) {
    items.push('Trust- oder Social-Proof-Elemente im Material vorhanden.')
  }
  if (s.hasFaq) {
    items.push('FAQ / Einwandbehandlung erkennbar — gut für längere Kaufzyklen.')
  }
  if (s.hasOfferSpecificity) {
    items.push('Konkretes Angebot (Preis, Zeitrahmen oder Nutzen) erkennbar.')
  }
  if (s.domain) {
    items.push(`Domain-Kontext „${s.domain}" passt zu ${s.businessLabel}.`)
  }

  if (items.length === 0) {
    items.push('Ausgangsmaterial vorhanden — gezielte CRO-Hebel lassen sich ableiten.')
    if (s.inputKind === 'mixed') {
      items.push('URL + Copy kombiniert — gute Basis für kontextuelle Empfehlungen.')
    }
  }

  return items.slice(0, 4)
}

function buildImprovements(s: PageSignals): string[] {
  const items: string[] = []

  if (!s.hasCta) {
    items.push(
      s.businessType === 'local' || s.businessType === 'service'
        ? 'Primären CTA für Termin/Kontakt above-the-fold setzen (z. B. „Termin buchen“ oder „Anfrage senden“).'
        : s.businessType === 'ecommerce'
          ? 'Deutlichen Shop-CTA above-the-fold platzieren (z. B. „Zum Shop“ / „Jetzt kaufen“) — nur wenn passend zum Angebot.'
          : 'Eine dominante Hauptaktion above-the-fold ergänzen — abgeleitet aus eurem Angebot, nicht generisch.',
    )
  } else if (s.detectedCtas.length > 2) {
    items.push(
      `Mehrere CTAs konkurrieren (${s.detectedCtas.join(', ')}) — auf eine Primäraktion reduzieren, Sekundäraktion visuell schwächer.`,
    )
  }

  if (!s.hasSocialProof) {
    items.push(
      s.businessType === 'ecommerce'
        ? 'Trust-Zone ergänzen: Bewertungen, Zahlungsarten, Versand/Rückgabe direkt unter dem Hero.'
        : 'Social Proof (Kundenlogos, Bewertungen, Kennzahlen) direkt unter dem Hero platzieren.',
    )
  }

  if (!s.hasFaq && (s.businessType === 'saas' || s.businessType === 'service')) {
    items.push('FAQ-Block für typische Einwände vor dem Footer — reduziert Absprünge bei längerer Entscheidung.')
  }

  switch (s.businessType) {
    case 'saas':
      if (!s.hasFreeTrial && !s.hasSignupFlow) {
        items.push(
          'Falls ein Trial/Signup existiert: klar kommunizieren — wir haben keinen „Kostenlos testen“-Hinweis im Text gefunden.',
        )
      }
      if (!s.hasPricing) {
        items.push('Pricing oder „ab X €“ Transparenz erwägen — nur wenn ihr öffentlich preist (nicht erzwingen).')
      }
      break
    case 'ecommerce':
      items.push('Produkt-USPs, Versandkosten und Rückgabe in den ersten zwei Scroll-Screens sichtbar machen.')
      break
    case 'local':
    case 'service':
      if (!s.hasBookingContact) {
        items.push('Kontakt-/Buchungsweg prominent machen (Telefon, Formular, Kalender-Link).')
      }
      break
    case 'agency':
    case 'portfolio':
      items.push('Case Studies oder Projekt-Ergebnisse mit messbarem Outcome direkt nach dem Hero zeigen.')
      break
    case 'creator':
      items.push('Ein klares „Nächster Schritt“ (Newsletter, Kurs, Link-in-Bio) statt vieler gleichwertiger Links.')
      break
    default:
      break
  }

  if (!s.hasOfferSpecificity) {
    items.push('Outcome spezifischer formulieren (für wen, welches Ergebnis, in welchem Zeitrahmen).')
  }

  if (s.inputKind === 'url' && s.wordCount < 25) {
    items.push(
      'Für tiefere Analyse Hero-Headline, Subline und CTA-Text einfügen — reine URL liefert begrenzten Kontext.',
    )
  }

  return uniqueItems(items).slice(0, 5)
}

function buildQuickWins(s: PageSignals): string[] {
  const wins: string[] = []

  if (!s.hasCta) {
    wins.push(
      s.businessType === 'local'
        ? 'Hero-Button: „Termin vereinbaren“ oder „Jetzt anrufen“ — ein Klick, ein Ziel.'
        : s.businessType === 'ecommerce'
          ? 'Hero-CTA auf das wichtigste Produkt/Kategorie verlinken — kein generischer Platzhalter.'
          : s.businessType === 'saas'
            ? 'Primär-CTA auf euren echten Einstieg (Demo, Trial oder Kontakt) — nur wenn vorhanden.'
            : 'Einen sichtbaren Primär-Button im Hero ergänzen, der zum tatsächlichen nächsten Schritt passt.',
    )
  } else {
    const primary = s.detectedCtas[0] ?? 'Hauptaktion'
    wins.push(`CTA „${primary}“ visuell hervorheben (Kontrast +15 %, kurzer Benefit darunter).`)
  }

  if (!s.hasStickyCtaMention && s.hasCta) {
    wins.push('Auf Mobile: Sticky-CTA nach ~40 % Scroll testen (gleiche Copy wie Primär-CTA).')
  }

  if (s.businessType === 'ecommerce' && !s.hasTrustSignals) {
    wins.push('Unter dem Hero: 3 Trust-Badges (Versand, Rückgabe, Bewertung) als Icon-Zeile.')
  }

  if (s.businessType === 'saas' && s.hasFreeTrial) {
    wins.push('Trial-CTA mit Mikrocopy zur Risiko-Umkehr (z. B. „Keine Kreditkarte“ nur wenn zutreffend).')
  } else if (s.businessType === 'saas' && !s.hasFreeTrial) {
    wins.push('Statt generischem „Free Trial“: euren realen Einstieg benennen (Demo, Warteliste, Kontakt).')
  }

  wins.push(
    s.hasClearHeadline
      ? 'Headline auf ein messbares Outcome umstellen (Zahl oder Zeitrahmen, falls vertretbar).'
      : 'Erste Zeile: „Für [Zielgruppe] die [Ergebnis] ohne [Pain]“ — Template anpassen.',
  )

  if (!s.hasFaq) {
    wins.push('3 FAQ-Fragen aus echten Kundeneinwänden — je 2 Zeilen Antwort, vor dem Footer.')
  }

  return uniqueItems(wins).slice(0, 4)
}

function uniqueItems(items: string[]): string[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function analyzeLandingPageContent(raw: string): LandingAuditResult {
  const trimmed = raw.trim()
  const signals = analyzeSignals(trimmed)
  const categories = computeCategoryScores(signals)
  const overallScore = clampScore(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  )

  const strengths = buildStrengths(signals)
  const improvements = buildImprovements(signals)
  const quickWins = buildQuickWins(signals)

  return {
    overallScore,
    inputKind: signals.inputKind,
    businessType: signals.businessType,
    businessLabel: signals.businessLabel,
    detectedNiche: signals.niche,
    domainHint: signals.domain,
    categories,
    strengths,
    improvements,
    quickWins,
  }
}

export async function analyzeLandingPagePlaceholder(
  input: string,
): Promise<LandingAuditResult> {
  await delay()
  return analyzeLandingPageContent(input)
}
