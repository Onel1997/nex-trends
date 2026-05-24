import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

type SubscriptionStatus = "active" | "inactive";

type ProfileSubscriptionUpdate = {
  is_pro: boolean;
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

function getStripe(): Stripe {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt");
  }

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

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): {
  is_pro: boolean;
  subscription_status: SubscriptionStatus;
} {
  switch (status) {
    case "active":
    case "trialing":
      return { is_pro: true, subscription_status: "active" };
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
    case "past_due":
    case "incomplete":
    case "paused":
    default:
      return { is_pro: false, subscription_status: "inactive" };
  }
}

async function updateProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
  update: ProfileSubscriptionUpdate,
): Promise<void> {
  console.log("Update Profil für userId:", userId, update);

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    console.error("Profil-Check fehlgeschlagen:", selectError);
    throw selectError;
  }

  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: userId, ...update })
      .select();

    console.log("Insert-Ergebnis:", { data: inserted, error: insertError });

    if (insertError) {
      console.error("Profil-Insert fehlgeschlagen:", insertError);
      throw insertError;
    }

    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId)
    .select();

  console.log("Update-Ergebnis:", { data, error });

  if (error) {
    console.error("Profil-Update fehlgeschlagen:", error);
    throw error;
  }

  if (!data?.length) {
    console.warn("Kein Profil aktualisiert für userId:", userId);
  }
}

async function resolveUserId(
  supabase: SupabaseClient,
  params: {
    metadataUserId?: string | null;
    subscriptionId?: string | null;
    customerId?: string | null;
  },
): Promise<string | null> {
  if (params.metadataUserId) {
    return params.metadataUserId;
  }

  if (params.subscriptionId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", params.subscriptionId)
      .maybeSingle();

    if (error) {
      console.error("Lookup per subscription_id fehlgeschlagen:", error);
      throw error;
    }

    if (data?.id) return data.id;
  }

  if (params.customerId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", params.customerId)
      .maybeSingle();

    if (error) {
      console.error("Lookup per customer_id fehlgeschlagen:", error);
      throw error;
    }

    if (data?.id) return data.id;
  }

  return null;
}

async function handleCheckoutSessionCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.client_reference_id ??
    session.metadata?.supabase_user_id ??
    null;

  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);

  console.log("checkout.session.completed:", {
    userId,
    customerId,
    subscriptionId,
    sessionId: session.id,
  });

  if (!userId) {
    console.warn(
      "checkout.session.completed ohne client_reference_id / supabase_user_id",
    );
    return;
  }

  await updateProfileByUserId(supabase, userId, {
    is_pro: true,
    subscription_status: "active",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });

  console.log("Pro freigeschaltet nach Checkout:", userId);
}

async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = stripeId(subscription.customer);
  const subscriptionId = subscription.id;
  const metadataUserId = subscription.metadata?.supabase_user_id ?? null;

  const userId = await resolveUserId(supabase, {
    metadataUserId,
    subscriptionId,
    customerId,
  });

  console.log("customer.subscription.updated:", {
    userId,
    stripeStatus: subscription.status,
    subscriptionId,
    customerId,
  });

  if (!userId) {
    console.warn(
      "customer.subscription.updated: Kein User gefunden",
      { subscriptionId, customerId },
    );
    return;
  }

  const mapped = mapStripeSubscriptionStatus(subscription.status);

  await updateProfileByUserId(supabase, userId, {
    ...mapped,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });
}

async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = stripeId(subscription.customer);
  const subscriptionId = subscription.id;
  const metadataUserId = subscription.metadata?.supabase_user_id ?? null;

  const userId = await resolveUserId(supabase, {
    metadataUserId,
    subscriptionId,
    customerId,
  });

  console.log("customer.subscription.deleted:", {
    userId,
    subscriptionId,
    customerId,
  });

  if (!userId) {
    console.warn(
      "customer.subscription.deleted: Kein User gefunden",
      { subscriptionId, customerId },
    );
    return;
  }

  await updateProfileByUserId(supabase, userId, {
    is_pro: false,
    subscription_status: "inactive",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      console.error("Fehlende Stripe-Signatur");
      return new Response("Fehlende Stripe-Signatur", { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET ist nicht gesetzt");
      return new Response("STRIPE_WEBHOOK_SECRET ist nicht gesetzt", {
        status: 500,
      });
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error("Webhook-Signatur ungültig:", err);
      const message = err instanceof Error ? err.message : String(err);
      return new Response(`Webhook-Fehler: ${message}`, { status: 400 });
    }

    console.log("Stripe Event:", event.type, "id:", event.id);

    const supabase = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          supabase,
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          supabase,
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        console.log("Event ignoriert:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("FEHLER in stripe-webhook:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Server-Fehler: ${message}`, { status: 500 });
  }
});
