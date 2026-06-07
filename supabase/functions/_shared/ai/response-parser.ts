/** Parse structured JSON responses from AI models. */

import {
  type PremiumHook,
  parsePremiumHooksField,
} from "./premium-hook.ts";

export type { PremiumHook } from "./premium-hook.ts";
export {
  HOOK_FRAMEWORKS,
  analyzeFrameworkCoverage,
  assertFullFrameworkCoverage,
  assembleFrameworkHooks,
  getMissingFrameworks,
  isKnownFramework,
  isLegacyPremiumHook,
  legacyPremiumHook,
  mergeHookSets,
  normalizePremiumHook,
} from "./premium-hook.ts";

const HOOK_OBJECT_KEYS = ["hook", "text", "content", "headline", "title", "value"];

function coerceHookString(item: unknown): string | null {
  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof item === "number" || typeof item === "boolean") {
    const text = String(item).trim();
    return text.length > 0 ? text : null;
  }

  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;

  for (const key of HOOK_OBJECT_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const stringValues = Object.values(record).filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  if (stringValues.length === 1) {
    return stringValues[0].trim();
  }

  return null;
}

/** @deprecated Legacy string-only parser — kept for backward compatibility. */
export function parseStringArrayField(
  parsed: unknown,
  field: string,
  maxItems = 10,
): string[] {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Ungültige AI-Antwort.");
  }

  const value = (parsed as Record<string, unknown>)[field];

  if (!Array.isArray(value)) {
    throw new Error(`Feld „${field}“ fehlt in der AI-Antwort.`);
  }

  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of value) {
    const text = coerceHookString(item);
    if (text && !seen.has(text)) {
      seen.add(text);
      items.push(text);
    }
  }

  if (items.length === 0) {
    throw new Error("Keine gültigen Ergebnisse generiert.");
  }

  return items.slice(0, maxItems);
}

/** @deprecated Legacy string-only parser — kept for backward compatibility. */
export function parseHooksResponse(content: string, expected = 10): string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI-Antwort konnte nicht als JSON gelesen werden.");
  }

  return parseStringArrayField(parsed, "hooks", expected);
}

export function parsePremiumHooksResponse(
  content: string,
  expected = 10,
): PremiumHook[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI-Antwort konnte nicht als JSON gelesen werden.");
  }

  return parsePremiumHooksField(parsed, "hooks", expected);
}
