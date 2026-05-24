import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function unauthorized(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: jsonHeaders,
  });
}

type StripeApiError = {
  message?: string;
  type?: string;
  code?: string;
  param?: string;
};

type StripeCheckoutSession = {
  url: string | null;
  client_reference_id: string | null;
  error?: StripeApiError;
};

type StripePrice = {
  id: string;
  active: boolean;
  livemode: boolean;
  error?: StripeApiError;
};

function getStripeMode(secretKey: string): "test" | "live" | "unknown" {
  if (secretKey.startsWith("sk_test_")) return "test";
  if (secretKey.startsWith("sk_live_")) return "live";
  return "unknown";
}

function loadStripeConfig() {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const priceId = Deno.env.get("STRIPE_PRICE_ID")?.trim();

  // Temporäre Debug-Logs – nach erfolgreichem Test wieder entfernen
  console.log("[DEBUG] Stripe Secrets geladen:", {
    priceId,
    priceIdLength: priceId?.length ?? 0,
    secretKeyPrefix: stripeSecretKey?.slice(0, 8) ?? null,
    secretKeyMode: stripeSecretKey ? getStripeMode(stripeSecretKey) : null,
    deployHint:
      "Nach Secret-Änderung in Supabase: Function neu deployen (Secrets werden beim Cold Start geladen)",
  });

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt");
  }

  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID ist nicht gesetzt");
  }

  if (!/^price_[a-zA-Z0-9]+$/.test(priceId)) {
    throw new Error(
      `STRIPE_PRICE_ID ungültig (versteckte Zeichen/Leerzeichen?): "${priceId}" (Länge: ${priceId.length})`,
    );
  }

  return { stripeSecretKey, priceId };
}

async function verifyStripePrice(
  secretKey: string,
  priceId: string,
): Promise<StripePrice> {
  const response = await fetch(
    `https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const data = (await response.json()) as StripePrice;

  if (!response.ok) {
    console.error("[DEBUG] Price-Verifikation fehlgeschlagen:", {
      priceId,
      status: response.status,
      stripeError: data.error,
    });

    throw new Error(
      data.error?.message ??
        `Stripe Price "${priceId}" nicht gefunden (Status ${response.status})`,
    );
  }

  const keyMode = getStripeMode(secretKey);

  console.log("[DEBUG] Price verifiziert:", {
    priceId: data.id,
    active: data.active,
    livemode: data.livemode,
    secretKeyMode: keyMode,
  });

  if (keyMode === "test" && data.livemode) {
    throw new Error(
      `Modus-Konflikt: STRIPE_SECRET_KEY ist Test (sk_test_), aber STRIPE_PRICE_ID "${priceId}" ist ein Live-Preis. Bitte Test-Price-ID aus dem Stripe Test-Dashboard setzen.`,
    );
  }

  if (keyMode === "live" && !data.livemode) {
    throw new Error(
      `Modus-Konflikt: STRIPE_SECRET_KEY ist Live (sk_live_), aber STRIPE_PRICE_ID "${priceId}" ist ein Test-Preis.`,
    );
  }

  if (!data.active) {
    throw new Error(`STRIPE_PRICE_ID "${priceId}" ist in Stripe nicht aktiv.`);
  }

  return data;
}

async function createStripeCheckoutSession(params: {
  secretKey: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}): Promise<StripeCheckoutSession> {
  console.log("[DEBUG] Erstelle Checkout-Session mit priceId:", params.priceId);

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", params.priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", params.successUrl);
  body.set("cancel_url", params.cancelUrl);
  body.set("client_reference_id", params.userId);
  body.set("metadata[supabase_user_id]", params.userId);
  body.set("subscription_data[metadata][supabase_user_id]", params.userId);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = (await response.json()) as StripeCheckoutSession;

  if (!response.ok) {
    console.error("[DEBUG] Stripe Checkout Session Fehler:", {
      status: response.status,
      usedPriceId: params.priceId,
      stripeError: data.error,
    });

    throw new Error(
      data.error?.message ?? `Stripe API Fehler (Status ${response.status})`,
    );
  }

  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      console.warn(
        "create-checkout-session: Authorization-Header fehlt oder ungültig",
      );
      return unauthorized("Nicht authentifiziert");
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      console.warn("create-checkout-session: Bearer-Token ist leer");
      return unauthorized("Kein Auth-Token vorhanden");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL oder SUPABASE_ANON_KEY fehlt");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    console.log("Auth-Ergebnis:", {
      userId: user?.id ?? null,
      authError: authError?.message ?? null,
    });

    if (authError) {
      console.warn("create-checkout-session: Auth-Fehler:", authError.message);
      return unauthorized("Authentifizierung fehlgeschlagen");
    }

    const userId = user?.id;

    if (!userId) {
      console.warn("create-checkout-session: Keine userId im Auth-Response");
      return unauthorized("User nicht gefunden");
    }

    const { stripeSecretKey, priceId } = loadStripeConfig();

    await verifyStripePrice(stripeSecretKey, priceId);

    const { successUrl, cancelUrl } = await req.json().catch(() => ({}));
    const origin = req.headers.get("origin") ?? "";
    const defaultReturnUrl =
      origin || Deno.env.get("SITE_URL")?.trim() || "";

    console.log("User-ID vor Stripe-Session:", userId);

    const session = await createStripeCheckoutSession({
      secretKey: stripeSecretKey,
      priceId,
      successUrl: successUrl ?? `${defaultReturnUrl}/?checkout=success`,
      cancelUrl: cancelUrl ?? `${defaultReturnUrl}/?checkout=cancel`,
      userId,
    });

    console.log("Stripe Session erstellt:", {
      client_reference_id: session.client_reference_id,
      url: session.url ? "ok" : null,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error("FEHLER in create-checkout-session:", err);

    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
