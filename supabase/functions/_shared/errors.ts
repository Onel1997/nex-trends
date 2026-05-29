/** Normalize thrown values (Postgrest, OpenAI, Error) into user-visible strings. */

type RecordError = {
  message?: unknown;
  error?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
};

function pickString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function formatEdgeError(err: unknown): string {
  if (err == null) return "Unbekannter Serverfehler.";

  if (err instanceof Error) {
    const msg = pickString(err.message);
    if (msg && msg !== "[object Object]") return msg;
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause != null && cause !== err) {
      return formatEdgeError(cause);
    }
    return msg ?? "Unbekannter Serverfehler.";
  }

  if (typeof err === "string") {
    return pickString(err) ?? "Unbekannter Serverfehler.";
  }

  if (typeof err === "object") {
    const record = err as RecordError;

    const message = pickString(record.message);
    if (message) return message;

    const nestedError = pickString(record.error);
    if (nestedError) return nestedError;

    const details = pickString(record.details);
    if (details) return details;

    const hint = pickString(record.hint);
    const code = pickString(record.code);
    if (code && hint) return `${code}: ${hint}`;
    if (code) return `Datenbankfehler (${code}).`;
  }

  const fallback = String(err);
  if (fallback && fallback !== "[object Object]") return fallback;

  return "Unbekannter Serverfehler.";
}

export function logEdgeError(scope: string, err: unknown, context?: Record<string, unknown>) {
  console.error(`[${scope}] FEHLER:`, formatEdgeError(err), {
    raw: err,
    ...context,
  });
}
