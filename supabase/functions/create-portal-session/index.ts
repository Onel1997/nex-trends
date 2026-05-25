import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Nicht authentifiziert" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !stripeSecretKey) {
      throw new Error("Missing environment configuration");
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(
      authHeader.replace(/^Bearer\s+/i, "").trim(),
    );

    if (authError || !user?.id) {
      return new Response(JSON.stringify({ error: "User nicht gefunden" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id as string | null;

    if (!customerId) {
      const body = new URLSearchParams();
      body.set("email", user.email ?? "");
      body.set("metadata[supabase_user_id]", user.id);

      const customerRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const customer = await customerRes.json();
      if (!customerRes.ok) {
        throw new Error(customer?.error?.message ?? "Could not create Stripe customer");
      }
      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const { returnUrl } = await req.json().catch(() => ({}));
    const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL")?.trim() ?? "";

    const portalBody = new URLSearchParams();
    portalBody.set("customer", customerId!);
    portalBody.set("return_url", returnUrl ?? `${origin}/dashboard/billing`);

    const portalRes = await fetch(
      "https://api.stripe.com/v1/billing_portal/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: portalBody.toString(),
      },
    );

    const portal = await portalRes.json();
    if (!portalRes.ok) {
      throw new Error(portal?.error?.message ?? "Portal session failed");
    }

    return new Response(JSON.stringify({ url: portal.url }), {
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
