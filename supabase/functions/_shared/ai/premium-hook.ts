/** Premium hook schema — shared by prompt builder and response parser. */

export const HOOK_FRAMEWORKS = [
  "Contrarian",
  "Result First",
  "Myth Bust",
  "Identity Callout",
  "Comparison",
  "Authority",
  "Social Proof",
  "Challenge",
  "Negative Hook",
  "Specificity Hook",
] as const;

export type HookFramework = (typeof HOOK_FRAMEWORKS)[number];

export type PremiumHook = {
  text: string;
  framework: string;
  trigger: string;
  retentionScore: number;
  whyItWorks: string;
};

export type FrameworkCoverageResult = {
  complete: boolean;
  missing: HookFramework[];
  duplicates: HookFramework[];
  covered: HookFramework[];
  hooksByFramework: Map<HookFramework, PremiumHook>;
};

const FRAMEWORK_ALIASES: Record<string, HookFramework> = {
  contrarian: "Contrarian",
  "result first": "Result First",
  "result-first": "Result First",
  resultfirst: "Result First",
  "myth bust": "Myth Bust",
  "myth-bust": "Myth Bust",
  mythbust: "Myth Bust",
  "identity callout": "Identity Callout",
  "identity-callout": "Identity Callout",
  identitycallout: "Identity Callout",
  comparison: "Comparison",
  authority: "Authority",
  "social proof": "Social Proof",
  "social-proof": "Social Proof",
  socialproof: "Social Proof",
  challenge: "Challenge",
  "negative hook": "Negative Hook",
  "negative-hook": "Negative Hook",
  negativehook: "Negative Hook",
  "specificity hook": "Specificity Hook",
  "specificity-hook": "Specificity Hook",
  specificityhook: "Specificity Hook",
  specificity: "Specificity Hook",
};

const FRAMEWORK_SET = new Set<string>(HOOK_FRAMEWORKS);

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampRetentionScore(value: unknown, fallback = 82): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(99, Math.max(70, Math.round(n)));
}

export function normalizeFramework(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "";

  const canonical = FRAMEWORK_ALIASES[raw.toLowerCase().replace(/\s+/g, " ")];
  if (canonical) return canonical;

  const match = HOOK_FRAMEWORKS.find(
    (f) => f.toLowerCase() === raw.toLowerCase(),
  );
  return match ?? raw;
}

export function isKnownFramework(value: unknown): value is HookFramework {
  return FRAMEWORK_SET.has(normalizeFramework(value));
}

export function legacyPremiumHook(text: string): PremiumHook {
  return {
    text,
    framework: "",
    trigger: "",
    retentionScore: 0,
    whyItWorks: "",
  };
}

export function isLegacyPremiumHook(hook: PremiumHook): boolean {
  return hook.retentionScore === 0 && !hook.framework && !hook.trigger;
}

export function normalizePremiumHook(
  item: unknown,
  index = 0,
): PremiumHook | null {
  if (typeof item === "string") {
    const text = item.trim();
    return text.length > 0 ? legacyPremiumHook(text) : null;
  }

  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  const text = asString(record.text ?? record.hook ?? record.content);
  if (!text) return null;

  const framework = normalizeFramework(record.framework ?? record.style);
  const trigger = asString(record.trigger ?? record.psychologicalTrigger);
  const whyItWorks = asString(record.whyItWorks ?? record.why_it_works ?? record.explanation);
  const fallbackScore = 88 - index * 2;
  const hasMetadata = Boolean(
    framework || trigger || whyItWorks || record.retentionScore != null ||
    record.score != null,
  );

  return {
    text,
    framework,
    trigger,
    retentionScore: hasMetadata
      ? clampRetentionScore(record.retentionScore ?? record.score, fallbackScore)
      : 0,
    whyItWorks,
  };
}

/** Index hooks by canonical framework — keeps highest retentionScore on duplicates. */
export function indexHooksByFramework(
  hooks: PremiumHook[],
): Map<HookFramework, PremiumHook> {
  const map = new Map<HookFramework, PremiumHook>();

  for (const hook of hooks) {
    if (!isKnownFramework(hook.framework)) continue;

    const framework = normalizeFramework(hook.framework) as HookFramework;
    const normalized = { ...hook, framework };
    const existing = map.get(framework);

    if (!existing || normalized.retentionScore > existing.retentionScore) {
      map.set(framework, normalized);
    }
  }

  return map;
}

export function getMissingFrameworks(hooks: PremiumHook[]): HookFramework[] {
  const covered = indexHooksByFramework(hooks);
  return HOOK_FRAMEWORKS.filter((framework) => !covered.has(framework));
}

export function getDuplicateFrameworks(hooks: PremiumHook[]): HookFramework[] {
  const counts = new Map<HookFramework, number>();

  for (const hook of hooks) {
    if (!isKnownFramework(hook.framework)) continue;
    const framework = normalizeFramework(hook.framework) as HookFramework;
    counts.set(framework, (counts.get(framework) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([framework]) => framework);
}

export function analyzeFrameworkCoverage(
  hooks: PremiumHook[],
): FrameworkCoverageResult {
  const hooksByFramework = indexHooksByFramework(hooks);
  const covered = [...hooksByFramework.keys()];
  const missing = getMissingFrameworks(hooks);
  const duplicates = getDuplicateFrameworks(hooks);

  return {
    complete: missing.length === 0 && covered.length === HOOK_FRAMEWORKS.length,
    missing,
    duplicates,
    covered,
    hooksByFramework,
  };
}

/** Merge two hook sets — later set wins on retention score per framework. */
export function mergeHookSets(
  base: PremiumHook[],
  incoming: PremiumHook[],
): PremiumHook[] {
  const merged = indexHooksByFramework([...base, ...incoming]);
  return [...merged.values()];
}

/** Return exactly one hook per framework in canonical order (may be incomplete). */
export function assembleFrameworkHooks(hooks: PremiumHook[]): PremiumHook[] {
  const byFramework = indexHooksByFramework(hooks);
  return HOOK_FRAMEWORKS
    .map((framework) => byFramework.get(framework))
    .filter((hook): hook is PremiumHook => hook != null);
}

export function assertFullFrameworkCoverage(hooks: PremiumHook[]): PremiumHook[] {
  const assembled = assembleFrameworkHooks(hooks);
  const missing = getMissingFrameworks(assembled);

  if (missing.length > 0) {
    throw new Error(
      `Framework-Abdeckung unvollständig. Fehlend: ${missing.join(", ")}`,
    );
  }

  if (assembled.length !== HOOK_FRAMEWORKS.length) {
    throw new Error(
      `Erwartet ${HOOK_FRAMEWORKS.length} Hooks, erhalten ${assembled.length}.`,
    );
  }

  return assembled;
}

export function parsePremiumHooksField(
  parsed: unknown,
  field = "hooks",
  maxItems = 10,
): PremiumHook[] {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Ungültige AI-Antwort.");
  }

  const value = (parsed as Record<string, unknown>)[field];
  if (!Array.isArray(value)) {
    throw new Error(`Feld „${field}“ fehlt in der AI-Antwort.`);
  }

  const seen = new Set<string>();
  const items: PremiumHook[] = [];

  for (let i = 0; i < value.length; i++) {
    const hook = normalizePremiumHook(value[i], i);
    if (hook && !seen.has(hook.text)) {
      seen.add(hook.text);
      items.push(hook);
    }
  }

  if (items.length === 0) {
    throw new Error("Keine gültigen Ergebnisse generiert.");
  }

  return items.slice(0, maxItems);
}
