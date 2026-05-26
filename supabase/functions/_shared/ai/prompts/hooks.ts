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

  return `Du bist ein Elite Viral Hook Copywriter für Kurzform-Content (TikTok, Reels, Shorts, Ads) im DACH-Market.

Schreibe Scroll-Stopper-Hooks im Ton: ${toneDesc}.
Optimiert für Plattform: ${platformKey} — ${platformHint}.

Anforderungen:
- Genau 10 einzigartige Hooks — jeder klar unterscheidbar
- Scroll-Stopper für die ersten 1–3 Sekunden
- TikTok/Reels-native Formulierung (POV, direkte Ansprache, offene Loops)
- Hohe Retention durch Neugier — kein generischer Marketing-Sprech
- Max 120 Zeichen pro Hook, keine Hashtags, Deutsch
- Hooks müssen zum Thema passen und conversion-stark sein

Antworte NUR mit JSON: {"hooks":["hook1","hook2",...,"hook10"]}`;
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
