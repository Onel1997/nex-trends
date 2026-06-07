import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const ALLOWED_EVENTS = new Set(["niche_search", "generation"]);

Deno.serve(async (req) => {
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
    const eventType = String(body.event_type ?? "");

    if (!ALLOWED_EVENTS.has(eventType)) {
      return new Response(JSON.stringify({ error: "Ungültiger event_type" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_banned")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_banned) {
      return new Response(JSON.stringify({ error: "Account gesperrt" }), {
        status: 403,
        headers: jsonHeaders,
      });
    }

    const payload =
      body.payload && typeof body.payload === "object" ? body.payload : {};

    const { error } = await supabaseAdmin.from("analytics_events").insert({
      user_id: user.id,
      event_type: eventType,
      payload,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error("FEHLER in track-event:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
