/** Parse structured JSON responses from AI models. */

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

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (items.length === 0) {
    throw new Error("Keine gültigen Ergebnisse generiert.");
  }

  return items.slice(0, maxItems);
}

export function parseHooksResponse(content: string, expected = 10): string[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI-Antwort konnte nicht als JSON gelesen werden.");
  }

  return parseStringArrayField(parsed, "hooks", expected);
}
