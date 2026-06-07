/** Hook generator prompt builders — reusable for future AI text tools. */

import {
  HOOK_FRAMEWORKS,
  type HookFramework,
  type PremiumHook,
} from "../premium-hook.ts";

export const HOOK_TONE_LABELS: Record<string, string> = {
  aggressive: "Aggressive — direkt, konfrontativ, maximale Scroll-Stop-Power",
  luxury: "Luxury — quiet luxury, premium, aspirational, ruhig aber hochwertig",
  storytelling:
    "Storytelling — narrativ, emotional, persönliche Geschichte, starke Retention",
  faceless: "Faceless — voice-over, text-on-screen, skalierbar ohne Gesicht",
  ugc: "UGC — authentisch, raw, relatable, wie von einem echten User",
};

const TONE_ALIASES: Record<string, keyof typeof HOOK_TONE_LABELS> = {
  educational: "faceless",
  casual: "ugc",
  professional: "luxury",
};

const TONE_STYLE_DIRECTIVES: Record<keyof typeof HOOK_TONE_LABELS, string> = {
  aggressive: `AGGRESSIVE STIL (verbindlich für JEDEN Hook):
- Konfrontativ, ungeduldig, harte Wahrheiten — kein Weichspülen
- Direkte Du-Ansprache mit Druck: „Stopp.", „Du machst das falsch.", „Niemand sagt dir…"
- Kurze Schläge, Imperative, Pattern Interrupts — Scroll-Stop in Wort 1–3
- Erlaubt: Provokation, Tabubruch, Challenge, leichte Aggression (nicht beleidigend)
- Verboten: weiche Formulierungen, Premium-Vokabular, erzählerische Ich-Perspektive, Tutorial-Ton`,
  luxury: `LUXURY STIL (verbindlich für JEDEN Hook):
- Quiet Luxury: zurückhaltend, selbstbewusst, aspirational — nie laut oder billig
- Premium-Wortwahl: exklusiv, kuratiert, Investment, Standard, Signatur, Ritual
- Ruhiger Rhythmus, elegante Satzmelodie — kein Slang, keine Ausrufezeichen-Flut
- FOMO durch Exklusivität und Status, nicht durch Schreien
- Verboten: „Stopp.", Straßen-Slang, Tutorial-Schritte, rohe UGC-Sprache, Konfrontation`,
  storytelling: `STORYTELLING STIL (verbindlich für JEDEN Hook):
- Persönliche Ich-Erzählung: „Ich hab…", „Vor 6 Monaten…", „Als ich…" — emotionale Reise
- Cliffhanger und offene Loops: Leser MUSS wissen, wie es weitergeht
- Verletzlichkeit, Wendepunkt, Before/After implizit in Satz 1
- Narrativer Fluss statt Listen oder Fakten-Bullets
- Verboten: reine How-to-Anleitungen, Premium-Posing, aggressive Konfrontation, Casual-Filler`,
  faceless: `FACELESS / EDUCATIONAL STIL (verbindlich für JEDEN Hook):
- Voice-over & Text-on-Screen: klar, lehrreich, strukturiert — kein Gesicht nötig
- „So geht's:", „Der Fehler Nr. 1:", „3 Sekunden Regel:" — Wissens- und How-to-Energie
- Sachlich-didaktisch aber spannend: Fakten + Neugier-Lücke, nicht langweilig
- Ideal für Erklär-Reels: konkret, spezifisch, merkfähig
- Verboten: persönliche Geschichten in Ich-Form, Luxury-Posing, roher UGC-Slang, aggressive Angriffe`,
  ugc: `UGC / CASUAL STIL (verbindlich für JEDEN Hook):
- Wie ein echter User: locker, ungefiltert, relatable — „Okay also…", „Niemand redet darüber…"
- Imperfekt und menschlich: Alltagssprache, leichte Unsicherheit, „ich schwöre", „real talk"
- Authentisch-raw, nicht poliert — fühlt sich an wie Front-Cam, nicht wie Agentur
- Community-Vibe: Insider-Wissen teilen, nicht belehren
- Verboten: Corporate-Sprache, Premium-Vokabular, formelle Lehr-Tonlage, aggressive Konfrontation`,
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

const FRAMEWORK_LIST = HOOK_FRAMEWORKS.map((f) => `"${f}"`).join(", ");

const FRAMEWORK_DISTRIBUTION = HOOK_FRAMEWORKS.map(
  (framework, index) => `${index + 1}. ${framework}`,
).join("\n");

const PREMIUM_HOOK_JSON_SHAPE =
  `{"text":"…","framework":"Contrarian","trigger":"Cognitive Dissonance","retentionScore":91,"whyItWorks":"…"}`;

export function normalizeHookTone(tone: string): string {
  const key = tone.trim().toLowerCase();
  if (HOOK_TONE_LABELS[key]) return key;
  if (TONE_ALIASES[key]) return TONE_ALIASES[key];
  return "aggressive";
}

function resolveToneKey(tone: string): keyof typeof HOOK_TONE_LABELS {
  return normalizeHookTone(tone) as keyof typeof HOOK_TONE_LABELS;
}

function buildTonePromptBlock(tone: string): string {
  const toneKey = resolveToneKey(tone);
  const toneDesc = HOOK_TONE_LABELS[toneKey];
  const directives = TONE_STYLE_DIRECTIVES[toneKey];

  return `TON — ${toneDesc}

${directives}

KRITISCH: Jeder der 10 Hooks MUSS eindeutig im obigen Ton geschrieben sein.
Wenn man nur den Ton wechselt, müssen sich Wortwahl, Rhythmus und Energie komplett unterscheiden — nicht nur einzelne Adjektive.`;
}

export function normalizeHookPlatform(platform: string): string {
  const match = HOOK_PLATFORMS.find(
    (p) => p.toLowerCase() === platform.trim().toLowerCase(),
  );
  return match ?? "Universal";
}

export function buildHookSystemPrompt(tone: string, platform: string): string {
  const platformKey = normalizeHookPlatform(platform);
  const platformHint = PLATFORM_HINTS[platformKey] ?? PLATFORM_HINTS.Universal;
  const toneBlock = buildTonePromptBlock(tone);

  return `Du bist ein Elite Viral Hook Copywriter für Creator im DACH-Market (TikTok, Instagram Reels, YouTube Shorts).

Zielgruppe: Solo-Creator, UGC-Brands und Performance-Marketer — keine Corporate-Sprache.

${toneBlock}

Plattform: ${platformKey} — ${platformHint}

KRITISCH — Framework-Regeln (verbindlich):
- Genau 10 Hooks total
- Genau 1 Hook pro Framework — KEINE Duplikate
- Das Feld "framework" muss EXAKT einen dieser Werte haben: ${FRAMEWORK_LIST}
- Alle 10 Frameworks müssen vorkommen — keines darf fehlen

Pflicht-Framework-Verteilung (jeweils exakt 1 Hook):
${FRAMEWORK_DISTRIBUTION}

Jeder Hook muss:
- in Sekunde 1 emotional triggern (Neugier, Schock, Identifikation, FOMO, Kontrast, Loss Aversion, Authority)
- wie ein echter Creator klingen — nicht wie Werbung oder LinkedIn
- Retention maximieren: offene Loops, POV, direkte Du-Ansprache, Pattern Interrupts
- modern & 2025/2026-native sein (keine veralteten Clickbait-Klischees wie „Du glaubst nicht…“)
- plattformspezifisch filmbar sein (Overlay-Text, Voice-over, erste Frame-Idee implizit)
- zum Thema/Nische passen

Stil-Regeln:
- Max 120 Zeichen pro Hook-Text
- Deutsch, keine Hashtags, keine Emojis
- Keine generischen Floskeln („In diesem Video zeige ich…“, „Hier sind 5 Tipps…“)
- retentionScore: Ganzzahl 70–99 (höher = stärkerer Scroll-Stop & Retention-Potenzial)
- trigger: genau ein primärer psychologischer Trigger (z. B. Curiosity Gap, Loss Aversion, Social Proof, Identity Threat, FOMO, Authority, Cognitive Dissonance, Specificity)
- whyItWorks: 1 kurzer Satz (max 120 Zeichen), warum der Hook in Sekunde 1 hält

Antworte NUR mit gültigem JSON:
{"hooks":[${PREMIUM_HOOK_JSON_SHAPE}, … genau 10 Objekte]}`;
}

export function buildMissingFrameworksSystemPrompt(
  missing: HookFramework[],
  tone: string,
  platform: string,
): string {
  const platformKey = normalizeHookPlatform(platform);
  const platformHint = PLATFORM_HINTS[platformKey] ?? PLATFORM_HINTS.Universal;
  const toneBlock = buildTonePromptBlock(tone);
  const missingList = missing.map((framework) => `- ${framework}`).join("\n");

  return `Du bist ein Elite Viral Hook Copywriter für Creator im DACH-Market.

${toneBlock}

Plattform: ${platformKey} — ${platformHint}

AUFGABE: Generiere NUR die fehlenden Framework-Hooks — nichts anderes.

Fehlende Frameworks (genau ${missing.length} Hook${missing.length === 1 ? "" : "s"}):
${missingList}

Regeln:
- Genau 1 Hook pro fehlendem Framework
- "framework" muss EXAKT dem Framework-Namen entsprechen
- Max 120 Zeichen pro Hook-Text, Deutsch, keine Hashtags, keine Emojis
- retentionScore: 70–99, trigger + whyItWorks Pflicht

Antworte NUR mit gültigem JSON:
{"hooks":[${PREMIUM_HOOK_JSON_SHAPE}, … genau ${missing.length} Objekte]}`;
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

  const toneKey = resolveToneKey(input.tone);
  lines.push(`Gewählter Ton: ${toneKey} — ${HOOK_TONE_LABELS[toneKey]}`);
  lines.push(
    `Schreibe ALLE Hooks strikt in diesem Ton. Wortwahl und Energie müssen sich klar von anderen Tönen unterscheiden.`,
  );
  lines.push(`Plattform: ${normalizeHookPlatform(input.platform)}`);

  return lines.join("\n");
}

export function buildMissingFrameworksUserMessage(
  input: HookGenerationInput,
  missing: HookFramework[],
  existing: PremiumHook[],
): string {
  const base = buildHookUserMessage(input);
  const covered = existing
    .map((hook) => hook.framework)
    .filter(Boolean)
    .join(", ");

  return `${base}

Bereits abgedeckte Frameworks (NICHT wiederholen): ${covered || "keine"}

Generiere NUR Hooks für diese fehlenden Frameworks:
${missing.map((framework) => `- ${framework}`).join("\n")}`;
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
