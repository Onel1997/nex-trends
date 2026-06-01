/** CORS for browser calls to edge functions (Vite/Next dev + production site). */

const EXACT_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.2.90:5173",
  "https://nextrends-ai.de",
]);

function isPrivateLanHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.")
  );
}

function isAllowedDevOrigin(origin: string): boolean {
  if (EXACT_ORIGINS.has(origin)) return true;
  try {
    const { hostname, port, protocol } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    if (!isPrivateLanHost(hostname)) return false;
    return port === "5173" || port === "3000" || port === "";
  } catch {
    return false;
  }
}

function siteOriginsFromEnv(): string[] {
  const origins: string[] = [];
  for (const key of ["SITE_URL", "NEXT_PUBLIC_SITE_URL", "VITE_SITE_URL"]) {
    const raw = Deno.env.get(key)?.trim();
    if (!raw) continue;
    try {
      origins.push(new URL(raw).origin);
    } catch {
      /* ignore */
    }
  }
  return origins;
}

/** Reflect browser Origin when allowed; required for supabase.functions.invoke from the app. */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const envOrigins = siteOriginsFromEnv();

  let allowOrigin = "http://localhost:5173";

  if (origin) {
    if (
      isAllowedDevOrigin(origin) ||
      EXACT_ORIGINS.has(origin) ||
      envOrigins.includes(origin)
    ) {
      allowOrigin = origin;
    } else if (origin.startsWith("https://")) {
      // Production / preview deployments (Vercel, etc.)
      allowOrigin = origin;
    }
  } else if (envOrigins[0]) {
    allowOrigin = envOrigins[0];
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonHeadersFor(req: Request): Record<string, string> {
  return { ...corsHeadersFor(req), "Content-Type": "application/json" };
}

const defaultCorsRequest = new Request("http://localhost", {
  headers: { Origin: "http://localhost:5173" },
});

export const defaultCorsHeaders = corsHeadersFor(defaultCorsRequest);
export const defaultJsonHeaders = jsonHeadersFor(defaultCorsRequest);
