import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import {
  recordAiGeneration,
  type GenerationStatus,
  type GenerationType,
} from "../_shared/analytics.ts";
import {
  consumeCredits,
  getCreditStatus,
  resolveFeatureCost,
} from "../_shared/credits.ts";
import { ensureProfile } from "../_shared/usage.ts";
import type { UsageActionId } from "../_shared/plans.ts";
import { corsHeadersFor, jsonHeadersFor } from "../_shared/cors.ts";

type ConsumeAction = "check" | "consume";

const VALID_FEATURES = new Set<string>([
  "trend_search",
  "hook_generation",
  "seo_title",
  "ad_copy",
  "landing_analysis",
  "ai_video",
  "voiceover",
  "captions",
]);

function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeadersFor(req),
  });
}

function readGenerationMeta(
  body: Record<string, unknown>,
  user: { id: string; email?: string },
  cost: number,
) {
  const tool = typeof body.tool === "string" ? body.tool : body.feature ?? "generation";
  const label = typeof body.label === "string" ? body.label : "";
  const niche = typeof body.niche === "string" ? body.niche : "";
  const platform = typeof body.platform === "string" ? body.platform : "";
  const promptRaw = typeof body.prompt === "string"
    ? body.prompt
    : label || String(tool);

  return {
    user_id: user.id,
    email: user.email ?? "",
    tool_used: tool,
    generation_type: (typeof body.generation_type === "string"
      ? body.generation_type
      : "text") as GenerationType,
    status: (typeof body.status === "string"
      ? body.status
      : "completed") as GenerationStatus,
    niche,
    platform,
    prompt: promptRaw,
    credits_used: cost,
    output_url: typeof body.output_url === "string" ? body.output_url : undefined,
    error_message: typeof body.error_message === "string"
      ? body.error_message
      : undefined,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeadersFor(req) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(req, { error: "Nicht authentifiziert" }, 401);
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
      return jsonResponse(req, { error: "User nicht gefunden" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const action = (body.action ?? "consume") as ConsumeAction;

    if (action !== "check" && action !== "consume") {
      return jsonResponse(req, { error: "Ungültige action" }, 400);
    }

    const featureRaw = typeof body.feature === "string"
      ? body.feature
      : typeof body.action_id === "string"
      ? body.action_id
      : typeof body.tool === "string"
      ? body.tool.replace(/-/g, "_")
      : null;

    if (action === "consume" && !featureRaw) {
      return jsonResponse(req, { error: "feature ist erforderlich" }, 400);
    }

    const feature = featureRaw ?? "generation";
    const normalizedFeature = feature.replace(/-/g, "_");

    if (action === "consume" && !VALID_FEATURES.has(normalizedFeature)) {
      console.warn("[consume-credits] unknown feature:", normalizedFeature);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const profile = await ensureProfile(supabaseAdmin, user.id, user.email);

    if (profile.is_banned) {
      return jsonResponse(req, {
        allowed: false,
        unlimited: false,
        used: profile.monthly_usage_count ?? 0,
        remaining: profile.credit_balance ?? 0,
        limit: null,
        usageResetDate: profile.usage_reset_date ?? null,
        error: "Account gesperrt",
      }, 403);
    }

    const explicitCost = typeof body.cost === "number" ? body.cost : undefined;
    const cost = resolveFeatureCost(normalizedFeature, explicitCost);
    const idempotencyKey = typeof body.idempotency_key === "string"
      ? body.idempotency_key
      : undefined;

    const metadata: Record<string, unknown> = {
      tool: body.tool,
      label: body.label,
      generation_type: body.generation_type,
      ...(typeof body.metadata === "object" && body.metadata !== null
        ? body.metadata as Record<string, unknown>
        : {}),
    };

    const result = action === "check"
      ? await getCreditStatus(supabaseAdmin, user.id, user.email)
      : await consumeCredits(supabaseAdmin, user.id, {
        feature: normalizedFeature as UsageActionId,
        cost,
        metadata,
        idempotencyKey,
        email: user.email,
      });

    if (
      action === "consume" &&
      result.allowed &&
      body.skip_analytics_log !== true
    ) {
      const recorded = await recordAiGeneration(
        supabaseAdmin,
        readGenerationMeta(body, user, cost),
      );
      console.log("[consume-credits] analytics", recorded.id, normalizedFeature);
    }

    const status = action === "check" ? 200 : (result.allowed ? 200 : 402);

    return jsonResponse(req, result, status);
  } catch (err) {
    console.error("[consume-credits] FEHLER:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(req, { error: message }, 500);
  }
});
