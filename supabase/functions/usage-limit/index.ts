import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import {
  checkUsageLimit,
  ensureUsagePeriod,
  incrementUsage,
  type ProfileUsageRow,
} from "../_shared/usage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

type UsageAction = "check" | "increment";

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

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Kein Auth-Token" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error("Supabase-Umgebungsvariablen fehlen");
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user?.id) {
      return new Response(JSON.stringify({ error: "User nicht gefunden" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = (body.action ?? "check") as UsageAction;

    if (action !== "check" && action !== "increment") {
      return new Response(JSON.stringify({ error: "Ungültige action" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, is_pro, subscription_status, monthly_usage_count, usage_reset_date",
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profil nicht gefunden:", profileError);
      return new Response(JSON.stringify({ error: "Profil nicht gefunden" }), {
        status: 404,
        headers: jsonHeaders,
      });
    }

    const currentProfile = await ensureUsagePeriod(
      supabaseAdmin,
      profile as ProfileUsageRow,
    );

    const result =
      action === "increment"
        ? await incrementUsage(supabaseAdmin, user.id, currentProfile)
        : checkUsageLimit(currentProfile);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error("FEHLER in usage-limit:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
