/** In-memory rate limiting + cooldown for AI edge functions. */

type RateEntry = {
  timestamps: number[];
  lastRequestAt: number;
};

const store = new Map<string, RateEntry>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const COOLDOWN_MS = 3_000;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number; reason: string };

export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(userId) ?? { timestamps: [], lastRequestAt: 0 };

  const sinceCooldown = now - entry.lastRequestAt;
  if (sinceCooldown < COOLDOWN_MS) {
    return {
      allowed: false,
      retryAfterMs: COOLDOWN_MS - sinceCooldown,
      reason: "Bitte warte kurz zwischen Generierungen.",
    };
  }

  const recent = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0] ?? now;
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - oldest),
      reason: "Zu viele Anfragen. Bitte versuche es in einer Minute erneut.",
    };
  }

  recent.push(now);
  store.set(userId, { timestamps: recent, lastRequestAt: now });

  return { allowed: true };
}

export function rateLimitHeaders(retryAfterMs: number): Record<string, string> {
  return {
    "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
  };
}
