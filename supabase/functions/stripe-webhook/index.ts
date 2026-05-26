import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import {
  mapStripePriceToPlan,
  normalizePlanId,
  type BillingPeriod,
  type PlanId,
} from "../_shared/plans.ts";
import { applyPlanToProfile } from "../_shared/usage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function getStripe(): Stripe {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt");
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

function getSupabaseAdmin(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt");
  }
  return createClient(url, serviceRoleKey);
}

function stripeId(
  value: string | Stripe.Customer | Stripe.Subscription | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function subscriptionIsActive(status: Stripe.Subscription.Status): boolean {
  return status === "active" || status === "trialing";
}

async function resolveUserId(
  supabase: SupabaseClient,
  params: {
    metadataUserId?: string | null;
    subscriptionId?: string | null;
    customerId?: string | null;
  },
): Promise<string | null> {
  if (params.metadataUserId) return params.metadataUserId;

  if (params.subscriptionId) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", params.subscriptionId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  if (params.customerId) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", params.customerId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

async function upsertSubscriptionRow(
  supabase: SupabaseClient,
  params: {
    userId: string;
    stripeSubscriptionId: string;
    stripePriceId: string | null;
    plan: PlanId;
    status: string;
    billingPeriod: BillingPeriod;
    currentPeriodEnd: string | null;
  },
): Promise<void> {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_price_id: params.stripePriceId,
      plan: params.plan,
      status: params.status,
      billing_period: params.billingPeriod,
      current_period_end: params.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) {
    console.error("[webhook] subscriptions upsert:", error);
    throw error;
  }
}

async function syncSubscription(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  metadataUserId?: string | null,
): Promise<void> {
  const customerId = stripeId(subscription.customer);
  const subscriptionId = subscription.id;
  const userId = await resolveUserId(supabase, {
    metadataUserId: metadataUserId ??
      subscription.metadata?.supabase_user_id ?? null,
    subscriptionId,
    customerId,
  });

  if (!userId) {
    console.warn("[webhook] No user for subscription", subscriptionId);
    return;
  }

  const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
  const metaPlan = normalizePlanId(subscription.metadata?.plan_id);
  const plan = mapStripePriceToPlan(priceId ?? "") ?? metaPlan;
  const billingPeriod = (subscription.metadata?.billing_period === "yearly"
    ? "yearly"
    : "monthly") as BillingPeriod;
  const active = subscriptionIsActive(subscription.status);
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await upsertSubscriptionRow(supabase, {
    userId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    plan,
    status: subscription.status,
    billingPeriod,
    currentPeriodEnd: periodEnd,
  });

  await applyPlanToProfile(
    supabase,
    userId,
    active ? plan : "free",
    active ? "active" : "inactive",
    { customerId, subscriptionId, periodEnd },
  );

  await supabase.from("profiles").update({
    billing_period: billingPeriod,
    credits_reset_at: periodEnd,
  }).eq("id", userId);
}

async function handleCheckoutSessionCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.client_reference_id ??
    session.metadata?.supabase_user_id ?? null;

  if (!userId) {
    console.warn("[webhook] checkout without user id");
    return;
  }

  const plan = normalizePlanId(session.metadata?.plan_id ?? "pro_creator");
  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);

  if (subscriptionId) {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscription(supabase, sub, userId);
    return;
  }

  await applyPlanToProfile(supabase, userId, plan, "active", {
    customerId,
    subscriptionId,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      return new Response("Missing Stripe-Signature", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();
    if (!webhookSecret) {
      return new Response("STRIPE_WEBHOOK_SECRET missing", { status: 500 });
    }

    const stripe = getStripe();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );

    const supabase = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.updated":
        await syncSubscription(
          supabase,
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await syncSubscription(
          supabase,
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        console.log("[webhook] ignored:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[webhook] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, { status: 500 });
  }
});
