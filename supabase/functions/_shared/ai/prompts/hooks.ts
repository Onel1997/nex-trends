/** Hook generator prompt builders — reusable for future AI text tools. */

export const HOOK_TONE_LABELS: Record<string, string> = {
  aggressive: "Aggressive — direkt, konfrontativ, maximale Scroll-Stop-Power",
  luxury: "Luxury — quiet luxury, premium, aspirational, ruhig aber hochwertig",
  storytelling:
    "Storytelling — narrativ, emotional, persönliche Geschichte, starke Retention",
  faceless: "Faceless — voice-over, text-on-screen, skalierbar ohne Gesicht",
  ugc: "UGC — authentisch, raw, relatable, wie von einem echten User",
};

export const HOOK_PLATFORMS = [
  "TikTok",
  "Instagram Reels",
  "YouTube Shorts",
  "Meta Ads",
  "Universal",
] as const;

export type HookPlatform = (typeof HOOK_PLATFORMS)[number];
export type HookTone = keyof typeof HOOK_TONE_LABELS;

export type HookGenerationInput = {
  topic: string;
  tone: string;
  platform: string;
  context?: string;
  trendTitle?: string;
  referenceHook?: string;
};

const PLATFORM_HINTS: Record<string, string> = {
  TikTok: "Schnelle POV-Hooks, Trend-Sprache, direkte Ansprache, Neugier-Lücken",
  "Instagram Reels":
    "Visuell denkbar, aspirational oder relatable, starke erste Zeile für Overlay-Text",
  "YouTube Shorts":
    "Klare Value-Prop in Sekunde 1, leicht längere Hooks erlaubt (max 140 Zeichen)",
  "Meta Ads":
    "Conversion-fokussiert, Pain-Point oder Benefit sofort, CTA-Nähe ohne Hashtags",
  Universal: "Plattform-neutral, maximale Wiederverwendbarkeit",
};

export function normalizeHookTone(tone: string): string {
  const key = tone.trim().toLowerCase();
  return HOOK_TONE_LABELS[key] ? key : "aggressive";
}

export function normalizeHookPlatform(platform: string): string {
  const match = HOOK_PLATFORMS.find(
    (p) => p.toLowerCase() === platform.trim().toLowerCase(),
  );
  return match ?? "Universal";
}

export function buildHookSystemPrompt(tone: string, platform: string): string {
  const toneKey = normalizeHookTone(tone);
  const platformKey = normalizeHookPlatform(platform);
  const toneDesc = HOOK_TONE_LABELS[toneKey] ?? HOOK_TONE_LABELS.aggressive;
  const platformHint = PLATFORM_HINTS[platformKey] ?? PLATFORM_HINTS.Universal;

  return `Du bist ein Elite Viral Hook Copywriter für Creator im DACH-Market (TikTok, Instagram Reels, YouTube Shorts).

Zielgruppe: Solo-Creator, UGC-Brands und Performance-Marketer — keine Corporate-Sprache.

Ton: ${toneDesc}
Plattform: ${platformKey} — ${platformHint}

Schreibe genau 10 Hooks, die:
- in Sekunde 1 emotional triggern (Neugier, Schock, Identifikation, FOMO, Kontrast)
- wie ein echter Creator klingen — nicht wie Werbung oder LinkedIn
- Retention maximieren: offene Loops, POV, „Wait for it“, direkte Du-Ansprache, Pattern Interrupts
- modern & 2025/2026-native sind (keine veralteten Clickbait-Klischees wie „Du glaubst nicht…“)
- plattformspezifisch denkbar sind (Overlay-Text, Voice-over, erste Frame-Idee implizit)
- zum Thema/Nische passen und sofort filmbar sind

Stil-Regeln:
- Max 120 Zeichen pro Hook
- Deutsch, keine Hashtags, keine Emojis
- Jeder Hook muss sich klar von den anderen unterscheiden (anderer Angle)
- Keine generischen Floskeln („In diesem Video zeige ich…“, „Hier sind 5 Tipps…“)

Antworte NUR mit gültigem JSON: {"hooks":["hook1","hook2",...,"hook10"]}`;
}

export function buildHookUserMessage(input: HookGenerationInput): string {
  const lines: string[] = [`Thema / Nische: ${input.topic.trim()}`];

  if (input.trendTitle?.trim()) {
    lines.push(`Trend-Titel: ${input.trendTitle.trim()}`);
  }
  if (input.referenceHook?.trim()) {
    lines.push(`Referenz-Hook (viral): ${input.referenceHook.trim()}`);
  }
  if (input.context?.trim()) {
    lines.push(`Zusätzlicher Kontext: ${input.context.trim()}`);
  }

  lines.push(`Ton: ${normalizeHookTone(input.tone)}`);
  lines.push(`Plattform: ${normalizeHookPlatform(input.platform)}`);

  return lines.join("\n");
}

export function validateHookInput(input: HookGenerationInput): string | null {
  const topic = input.topic?.trim() ?? "";
  if (topic.length < 2) {
    return "Thema muss mindestens 2 Zeichen haben.";
  }
  if (topic.length > 500) {
    return "Thema darf maximal 500 Zeichen haben.";
  }
  return null;
}
