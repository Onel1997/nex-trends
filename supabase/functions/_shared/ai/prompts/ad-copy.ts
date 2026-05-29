/** Ad copy generator prompt builders */

export const AD_COPY_TONE_LABELS: Record<string, string> = {
  aggressive: "Aggressive — direkt, konfrontativ, conversion-stark",
  luxury: "Luxury — quiet luxury, premium, aspirational",
  storytelling: "Storytelling — narrativ, emotional, persönliche Geschichte",
  faceless: "Faceless — voice-over, text-on-screen, skalierbar",
  ugc: "UGC — authentisch, raw, relatable",
};

export const AD_COPY_PLATFORMS = [
  "Meta Ads",
  "TikTok Ads",
  "Instagram Ads",
  "Google Ads",
  "LinkedIn Ads",
  "Universal",
] as const;

export type AdCopyPlatform = (typeof AD_COPY_PLATFORMS)[number];

export type AdCopyGenerationInput = {
  briefing: string;
  tone: string;
  platform: string;
};

const PLATFORM_HINTS: Record<string, string> = {
  "Meta Ads": "Feed & Stories, Pain-Point + Benefit, klare CTA, max 40 Zeichen Headline",
  "TikTok Ads": "Native UGC-Look, Hook in Headline, schnelle Value-Prop, CTA wie Kommentar/Link",
  "Instagram Ads": "Visuell, aspirational oder relatable, starke erste Zeile, CTA in Bio-Stil",
  "Google Ads": "Search/Display — keyword-nah, klare Value Prop, vertrauenswürdige CTA",
  "LinkedIn Ads": "B2B-professionell, ROI/Outcome-fokussiert, seriöse CTA",
  Universal: "Plattform-neutral, wiederverwendbar für Paid Social",
};

export function normalizeAdCopyTone(tone: string): string {
  const key = tone.trim().toLowerCase();
  return AD_COPY_TONE_LABELS[key] ? key : "aggressive";
}

export function normalizeAdCopyPlatform(platform: string): string {
  const match = AD_COPY_PLATFORMS.find(
    (p) => p.toLowerCase() === platform.trim().toLowerCase(),
  );
  return match ?? "Universal";
}

export function buildAdCopySystemPrompt(tone: string, platform: string): string {
  const toneKey = normalizeAdCopyTone(tone);
  const platformKey = normalizeAdCopyPlatform(platform);
  const toneDesc = AD_COPY_TONE_LABELS[toneKey] ?? AD_COPY_TONE_LABELS.aggressive;
  const platformHint = PLATFORM_HINTS[platformKey] ?? PLATFORM_HINTS.Universal;

  return `Du bist ein Elite Performance Marketing Copywriter für Paid Social & Search Ads im DACH-Market.

Schreibe Ad Copy im Ton: ${toneDesc}.
Optimiert für Plattform: ${platformKey} — ${platformHint}.

Anforderungen:
- Genau 5 einzigartige Ad-Varianten — jede klar unterscheidbar
- Jede Variante: headline (max 60 Zeichen), primaryText (max 250 Zeichen), cta (max 30 Zeichen)
- Conversion-stark, kein generischer Marketing-Sprech
- Headline = Scroll-Stopper / Hook
- primaryText = Value Prop + Social Proof oder Pain-Point
- cta = klare Handlungsaufforderung (z. B. "Jetzt testen", "Mehr erfahren")
- Deutsch, keine Hashtags

Antworte NUR mit JSON: {"ads":[{"headline":"...","primaryText":"...","cta":"..."}, ...]}`;
}

export function buildAdCopyUserMessage(input: AdCopyGenerationInput): string {
  const lines: string[] = [`Briefing: ${input.briefing.trim()}`];
  lines.push(`Ton: ${normalizeAdCopyTone(input.tone)}`);
  lines.push(`Plattform: ${normalizeAdCopyPlatform(input.platform)}`);
  return lines.join("\n");
}

export function validateAdCopyInput(input: AdCopyGenerationInput): string | null {
  const briefing = input.briefing?.trim() ?? "";
  if (briefing.length < 2) {
    return "Briefing muss mindestens 2 Zeichen haben.";
  }
  if (briefing.length > 800) {
    return "Briefing darf maximal 800 Zeichen haben.";
  }
  return null;
}

export type AdCopyItem = {
  headline: string;
  primaryText: string;
  cta: string;
};

function coerceAdItem(item: unknown): AdCopyItem | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const record = item as Record<string, unknown>;

  const headline =
    typeof record.headline === "string" ? record.headline.trim() :
    typeof record.title === "string" ? record.title.trim() : "";
  const primaryText =
    typeof record.primaryText === "string" ? record.primaryText.trim() :
    typeof record.primary_text === "string" ? record.primary_text.trim() :
    typeof record.body === "string" ? record.body.trim() : "";
  const cta =
    typeof record.cta === "string" ? record.cta.trim() :
    typeof record.callToAction === "string" ? record.callToAction.trim() : "";

  if (!headline && !primaryText) return null;

  return {
    headline: headline || primaryText.slice(0, 60),
    primaryText: primaryText || headline,
    cta: cta || "Jetzt starten",
  };
}

export function parseAdCopyResponse(content: string, expected = 5): AdCopyItem[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI-Antwort konnte nicht als JSON gelesen werden.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Ungültige AI-Antwort.");
  }

  const ads = (parsed as Record<string, unknown>).ads ??
    (parsed as Record<string, unknown>).variants;

  if (!Array.isArray(ads)) {
    throw new Error("Feld „ads“ fehlt in der AI-Antwort.");
  }

  const seen = new Set<string>();
  const items: AdCopyItem[] = [];

  for (const item of ads) {
    const ad = coerceAdItem(item);
    if (!ad) continue;
    const key = `${ad.headline}|||${ad.primaryText}|||${ad.cta}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(ad);
  }

  if (items.length === 0) {
    throw new Error("Keine gültigen Ad Copy Varianten generiert.");
  }

  return items.slice(0, expected);
}
