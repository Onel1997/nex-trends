/** Dev + LAN Vite origins allowed to call edge functions from the browser. */
const EXACT_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.2.90:5173",
]);

function isAllowedDevOrigin(origin: string): boolean {
  if (EXACT_ORIGINS.has(origin)) return true;
  try {
    const { hostname, port, protocol } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    if (port !== "5173") return false;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    );
  } catch {
    return false;
  }
}

/** CORS headers for browser calls from the Vite dev server (reflects allowed Origin). */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowOrigin =
    origin && isAllowedDevOrigin(origin) ? origin : "http://localhost:5173";

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

/** Static defaults for handlers that do not thread `req` through helpers yet. */
const defaultCorsRequest = new Request("http://localhost", {
  headers: { Origin: "http://localhost:5173" },
});

export const defaultCorsHeaders = corsHeadersFor(defaultCorsRequest);
export const defaultJsonHeaders = jsonHeadersFor(defaultCorsRequest);
