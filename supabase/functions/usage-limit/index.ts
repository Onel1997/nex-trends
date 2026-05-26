import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import {
  recordAiGeneration,
  updateAiGenerationStatus,
  type GenerationStatus,
  type GenerationType,
} from "../_shared/analytics.ts";
import {
  checkUsageLimit,
  ensureProfile,
  ensureWeeklyRefill,
  incrementUsage,
  resolveCreditCost,
  type ProfileUsageRow,
} from "../_shared/usage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

type UsageAction = "check" | "increment" | "log_generation" | "update_generation";

function readGenerationMeta(
  body: Record<string, unknown>,
  user: { id: string; email?: string },
) {
  const tool = typeof body.tool === "string" ? body.tool : "generation";
  const label = typeof body.label === "string" ? body.label : "";
  const niche = typeof body.niche === "string" ? body.niche : "";
  const platform = typeof body.platform === "string" ? body.platform : "";
  const promptRaw = typeof body.prompt === "string"
    ? body.prompt
    : label || tool;
  const credits = typeof body.credits_used === "number"
    ? body.credits_used
    : typeof body.cost === "number"
    ? body.cost
    : 1;
  const generation_type = (typeof body.generation_type === "string"
    ? body.generation_type
    : "text") as GenerationType;
  const status = (typeof body.status === "string"
    ? body.status
    : "completed") as GenerationStatus;

  return {
    user_id: user.id,
    email: user.email ?? "",
    tool_used: tool,
    generation_type,
    status,
    niche,
    platform,
    prompt: promptRaw,
    credits_used: credits,
    output_url: typeof body.output_url === "string" ? body.output_url : undefined,
    error_message: typeof body.error_message === "string"
      ? body.error_message
      : undefined,
  };
}

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
    const cost = typeof body.cost === "number" ? body.cost : 1;

    if (
      action !== "check" && action !== "increment" &&
      action !== "log_generation" && action !== "update_generation"
    ) {
      return new Response(JSON.stringify({ error: "Ungültige action" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const profile = await ensureProfile(supabaseAdmin, user.id, user.email);
    const currentProfile = await ensureWeeklyRefill(
      supabaseAdmin,
      profile as ProfileUsageRow,
      user.email,
    );

    if (currentProfile.is_banned) {
      return new Response(
        JSON.stringify({
          allowed: false,
          unlimited: false,
          used: currentProfile.monthly_usage_count ?? 0,
          remaining: currentProfile.credit_balance ?? 0,
          limit: null,
          usageResetDate: currentProfile.usage_reset_date ?? null,
          error: "Account gesperrt",
        }),
        { status: 403,
          headers: jsonHeaders },
      );
    }

    if (action === "update_generation") {
      const generationId = String(body.generation_id ?? "");
      const status = body.status as GenerationStatus;
      if (!generationId || !status) {
        return new Response(JSON.stringify({ error: "generation_id/status fehlt" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }
      const patch = await updateAiGenerationStatus(supabaseAdmin, generationId, {
        status,
        output_url: typeof body.output_url === "string" ? body.output_url : undefined,
        error_message: typeof body.error_message === "string"
          ? body.error_message
          : undefined,
      });
      return new Response(JSON.stringify({ ok: patch.ok }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    if (action === "log_generation") {
      const recorded = await recordAiGeneration(
        supabaseAdmin,
        readGenerationMeta(body, user),
      );
      const status = await checkUsageLimit(supabaseAdmin, user.id, user.email);
      return new Response(JSON.stringify({
        ok: recorded.ok,
        generationId: recorded.id ?? null,
        ...status,
      }), { status: 200, headers: jsonHeaders });
    }

    const usageAction = typeof body.action_id === "string"
      ? body.action_id
      : typeof body.tool === "string"
      ? body.tool
      : "generation";

    const creditCost = resolveCreditCost(usageAction, cost);
    const idempotencyKey = typeof body.idempotency_key === "string"
      ? body.idempotency_key
      : undefined;

    const result = action === "increment"
      ? await incrementUsage(
          supabaseAdmin,
          user.id,
          currentProfile,
          creditCost,
          {
            action: usageAction,
            email: user.email,
            metadata: {
              tool: body.tool,
              label: body.label,
              generation_type: body.generation_type,
            },
            idempotencyKey,
          },
        )
      : await checkUsageLimit(supabaseAdmin, user.id, user.email);

    if (action === "increment" && result.allowed && body.skip_analytics_log !== true) {
      const meta = readGenerationMeta({ ...body, cost: creditCost }, user);
      const recorded = await recordAiGeneration(supabaseAdmin, meta);
      console.log("[usage-limit] increment logged", recorded.id, meta.tool_used);
    }

    const httpStatus = action === "increment" && !result.allowed ? 402 : 200;

    return new Response(JSON.stringify(result), {
      status: httpStatus,
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error("[usage-limit] FEHLER:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
