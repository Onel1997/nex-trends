import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import {
  normalizePlanId,
  resolveCheckoutPriceId,
  type BillingPeriod,
  type PlanId,
} from "../_shared/plans.ts";

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

type StripeCheckoutSession = {
  url: string | null;
  client_reference_id: string | null;
  error?: { message?: string };
};

async function verifyStripePrice(secretKey: string, priceId: string) {
  const response = await fetch(
    `https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Price ${priceId} not found`);
  }
  if (!data.active) {
    throw new Error(`Price ${priceId} is not active in Stripe`);
  }
}

async function createStripeCheckoutSession(params: {
  secretKey: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  planId: PlanId;
  billingPeriod: BillingPeriod;
}): Promise<StripeCheckoutSession> {
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", params.priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", params.successUrl);
  body.set("cancel_url", params.cancelUrl);
  body.set("client_reference_id", params.userId);
  body.set("metadata[supabase_user_id]", params.userId);
  body.set("metadata[plan_id]", params.planId);
  body.set("metadata[billing_period]", params.billingPeriod);
  body.set("subscription_data[metadata][supabase_user_id]", params.userId);
  body.set("subscription_data[metadata][plan_id]", params.planId);
  body.set("subscription_data[metadata][billing_period]", params.billingPeriod);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return (await response.json()) as StripeCheckoutSession;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized("Nicht authentifiziert");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey || !stripeSecretKey) {
      throw new Error("Missing Supabase or Stripe configuration");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(
      authHeader.replace(/^Bearer\s+/i, "").trim(),
    );

    if (authError || !user?.id) {
      return unauthorized("User nicht gefunden");
    }

    const body = await req.json().catch(() => ({}));
    const planId = normalizePlanId(
      typeof body.planId === "string" ? body.planId : "pro_creator",
    );
    const billingPeriod = (body.billingPeriod === "yearly"
      ? "yearly"
      : "monthly") as BillingPeriod;

    if (planId === "free" || planId === "founder") {
      return new Response(JSON.stringify({ error: "Plan not checkout-eligible" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const priceId = resolveCheckoutPriceId(planId, billingPeriod);
    if (!priceId) {
      throw new Error(
        `No Stripe price configured for ${planId} (${billingPeriod}). Set STRIPE_PRICE_${planId.toUpperCase()}_${billingPeriod.toUpperCase()}.`,
      );
    }

    await verifyStripePrice(stripeSecretKey, priceId);

    const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL")?.trim() ?? "";
    const successUrl = body.successUrl ??
      `${origin}/billing/success`;
    const cancelUrl = body.cancelUrl ?? `${origin}/billing/cancel`;

    const session = await createStripeCheckoutSession({
      secretKey: stripeSecretKey,
      priceId,
      successUrl,
      cancelUrl,
      userId: user.id,
      planId,
      billingPeriod,
    });

    if (!session.url) {
      throw new Error(session.error?.message ?? "Stripe returned no checkout URL");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
