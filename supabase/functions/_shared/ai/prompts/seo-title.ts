/** SEO title generator prompt builders */

export const SEO_PLATFORMS = [
  "Google Search",
  "YouTube",
  "Blog",
  "LinkedIn",
  "Universal",
] as const;

export const SEO_INTENTS = [
  "informational",
  "commercial",
  "transactional",
  "navigational",
] as const;

export type SeoTitleGenerationInput = {
  briefing: string;
  keyword?: string;
  platform: string;
  searchIntent?: string;
};

const PLATFORM_HINTS: Record<string, string> = {
  "Google Search": "SERP-optimiert, 50–60 Zeichen, Power-Words, klare Suchintention",
  YouTube: "Neugier + Benefit, max ~70 Zeichen, emotionaler Hook",
  Blog: "Lesbar, keyword-nah, H1-tauglich, 55–65 Zeichen",
  LinkedIn: "Professionell, Outcome-fokussiert, B2B-tauglich",
  Universal: "Plattform-neutral, CTR-stark, wiederverwendbar",
};

export function normalizeSeoPlatform(platform: string): string {
  const match = SEO_PLATFORMS.find(
    (p) => p.toLowerCase() === platform.trim().toLowerCase(),
  );
  return match ?? "Google Search";
}

export function normalizeSeoIntent(intent: string): string {
  const key = intent.trim().toLowerCase();
  return SEO_INTENTS.includes(key as (typeof SEO_INTENTS)[number])
    ? key
    : "informational";
}

export function buildSeoTitleSystemPrompt(
  platform: string,
  searchIntent: string,
): string {
  const platformKey = normalizeSeoPlatform(platform);
  const intentKey = normalizeSeoIntent(searchIntent);
  const platformHint = PLATFORM_HINTS[platformKey] ?? PLATFORM_HINTS["Google Search"];

  return `Du bist ein Elite SEO & CTR Copywriter für den DACH-Markt.

Optimiert für: ${platformKey} — ${platformHint}.
Suchintention: ${intentKey}.

Anforderungen:
- Genau 5 einzigartige SEO-Titel — klar unterscheidbar
- title: max 70 Zeichen, ideal 50–60 für Google SERP
- seoScore, ctrScore, readabilityScore: jeweils Integer 0–100 (realistisch bewerten)
- keyword: Haupt-Keyword pro Titel (kurz)
- searchIntent: einer von informational | commercial | transactional | navigational
- Deutsch, keine Anführungszeichen im Titel, kein Clickbait-Lügen
- Zahlen, Jahr oder Power-Words wo sinnvoll für CTR

Antworte NUR mit JSON:
{"titles":[{"title":"...","seoScore":85,"ctrScore":78,"readabilityScore":90,"keyword":"...","searchIntent":"informational"}, ...]}`;
}

export function buildSeoTitleUserMessage(input: SeoTitleGenerationInput): string {
  const lines: string[] = [`Briefing: ${input.briefing.trim()}`];
  if (input.keyword?.trim()) lines.push(`Keyword: ${input.keyword.trim()}`);
  lines.push(`Plattform: ${normalizeSeoPlatform(input.platform)}`);
  lines.push(`Suchintention: ${normalizeSeoIntent(input.searchIntent ?? "informational")}`);
  return lines.join("\n");
}

export function validateSeoTitleInput(input: SeoTitleGenerationInput): string | null {
  const briefing = input.briefing?.trim() ?? "";
  if (briefing.length < 2) {
    return "Briefing muss mindestens 2 Zeichen haben.";
  }
  if (briefing.length > 800) {
    return "Briefing darf maximal 800 Zeichen haben.";
  }
  return null;
}

export type SeoTitleItem = {
  title: string;
  seoScore: number;
  ctrScore: number;
  readabilityScore: number;
  keyword: string;
  searchIntent: string;
};

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 75;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function coerceTitleItem(item: unknown): SeoTitleItem | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const record = item as Record<string, unknown>;

  const title =
    typeof record.title === "string"
      ? record.title.trim()
      : typeof record.title_text === "string"
        ? record.title_text.trim()
        : "";

  if (!title) return null;

  const keyword =
    typeof record.keyword === "string" && record.keyword.trim()
      ? record.keyword.trim()
      : title.split(" ").slice(0, 3).join(" ");

  const searchIntent = normalizeSeoIntent(
    typeof record.searchIntent === "string"
      ? record.searchIntent
      : typeof record.search_intent === "string"
        ? record.search_intent
        : "informational",
  );

  return {
    title,
    seoScore: clampScore(record.seoScore ?? record.seo_score),
    ctrScore: clampScore(record.ctrScore ?? record.ctr_score),
    readabilityScore: clampScore(
      record.readabilityScore ?? record.readability_score,
    ),
    keyword,
    searchIntent,
  };
}

export function parseSeoTitleResponse(raw: string, expected = 5): SeoTitleItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Ungültige AI-Antwort (kein JSON).");
    parsed = JSON.parse(match[0]);
  }

  const record = parsed as Record<string, unknown>;
  const list = Array.isArray(record.titles)
    ? record.titles
    : Array.isArray(record.items)
      ? record.items
      : Array.isArray(parsed)
        ? parsed
        : [];

  const titles: SeoTitleItem[] = [];
  const seen = new Set<string>();

  for (const item of list) {
    const coerced = coerceTitleItem(item);
    if (!coerced) continue;
    const key = coerced.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push(coerced);
    if (titles.length >= expected) break;
  }

  if (titles.length === 0) {
    throw new Error("Keine gültigen SEO-Titel in der AI-Antwort.");
  }

  return titles;
}
