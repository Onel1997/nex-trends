import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { callOpenAI } from "../_shared/ai/openai-client.ts";
import {
  buildHookSystemPrompt,
  buildHookUserMessage,
  validateHookInput,
  type HookGenerationInput,
} from "../_shared/ai/prompts/hooks.ts";
import { parseHooksResponse } from "../_shared/ai/response-parser.ts";
import {
  checkRateLimit,
  rateLimitHeaders,
} from "../_shared/ai/rate-limit.ts";
import { recordAiGeneration } from "../_shared/analytics.ts";
import { consumeCredits, resolveFeatureCost } from "../_shared/credits.ts";
import { ensureProfile } from "../_shared/usage.ts";
import { corsHeadersFor, jsonHeadersFor } from "../_shared/cors.ts";
import { formatEdgeError, logEdgeError } from "../_shared/errors.ts";

type Action = "generate" | "history" | "health";

function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeadersFor(req), ...extraHeaders },
  });
}

Deno.serve(async (req) => {
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
    const action = (body.action ?? "generate") as Action;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    let profile;
    try {
      profile = await ensureProfile(supabaseAdmin, user.id, user.email);
    } catch (profileErr) {
      logEdgeError("hook-generator", profileErr, { phase: "profile" });
      return jsonResponse(req, {
        error: `Profil konnte nicht geladen werden: ${formatEdgeError(profileErr)}`,
        step: "profile",
      }, 500);
    }

    if (profile.is_banned) {
      return jsonResponse(req, { error: "Account gesperrt" }, 403);
    }

    if (action === "health") {
      const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
      const model = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
      return jsonResponse(req, {
        ok: true,
        openai: Boolean(openaiKey),
        model,
        warning: openaiKey
          ? null
          : "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
      });
    }

    if (action === "history") {
      const limit = Math.min(
        Math.max(Number(body.limit) || 20, 1),
        50,
      );

      const { data, error } = await supabaseAdmin
        .from("generated_hooks")
        .select("id, topic, tone, platform, generated_hooks_json, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return jsonResponse(req, { generations: data ?? [] });
    }

    if (action !== "generate") {
      return jsonResponse(req, { error: "Ungültige action" }, 400);
    }

    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      return jsonResponse(
        req,
        {
          error: rateCheck.reason,
          retryAfterMs: rateCheck.retryAfterMs,
        },
        429,
        rateLimitHeaders(rateCheck.retryAfterMs),
      );
    }

    const input: HookGenerationInput = {
      topic: typeof body.topic === "string" ? body.topic : "",
      tone: typeof body.tone === "string" ? body.tone : "aggressive",
      platform: typeof body.platform === "string" ? body.platform : "TikTok",
      context: typeof body.context === "string" ? body.context : undefined,
      trendTitle: typeof body.trendTitle === "string" ? body.trendTitle : undefined,
      referenceHook: typeof body.referenceHook === "string"
        ? body.referenceHook
        : undefined,
    };

    const validationError = validateHookInput(input);
    if (validationError) {
      return jsonResponse(req, { error: validationError }, 400);
    }

    const skipCreditCharge = body.skipCreditCharge === true;
    const idempotencyKey = typeof body.idempotencyKey === "string"
      ? body.idempotencyKey.trim()
      : undefined;
    const hookCost = resolveFeatureCost("hook_generation", Number(body.cost) || undefined);

    if (!skipCreditCharge) {
      try {
        const creditResult = await consumeCredits(supabaseAdmin, user.id, {
          feature: "hook_generation",
          cost: hookCost,
          email: user.email,
          idempotencyKey,
          metadata: {
            topic: input.topic.slice(0, 80),
            platform: input.platform,
            tone: input.tone,
          },
        });

        if (!creditResult.allowed) {
          return jsonResponse(
            req,
            {
              error: creditResult.error ??
                "Nicht genug Credits für diese Generierung.",
              code: "insufficient_credits",
              remaining: creditResult.remaining,
              limit: creditResult.limit,
            },
            402,
          );
        }
      } catch (creditErr) {
        logEdgeError("hook-generator", creditErr, { phase: "credits" });
        return jsonResponse(req, {
          error: `Credits konnten nicht abgebucht werden: ${formatEdgeError(creditErr)}`,
          code: "credits_failed",
          step: "credits",
        }, 500);
      }
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      console.error("[hook-generator] OPENAI_API_KEY missing");
      return jsonResponse(req, {
        error:
          "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
        step: "env",
      }, 503);
    }

    const systemPrompt = buildHookSystemPrompt(input.tone, input.platform);
    const userMessage = buildHookUserMessage(input);

    console.log("[hook-generator] generating", {
      userId: user.id,
      topic: input.topic.slice(0, 40),
      tone: input.tone,
      platform: input.platform,
      model: Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini",
    });

    let rawContent: string;
    try {
      rawContent = await callOpenAI({
        systemPrompt,
        userMessage,
        temperature: 0.75,
        jsonMode: true,
      });
    } catch (openAiErr) {
      logEdgeError("hook-generator", openAiErr, { phase: "openai" });
      return jsonResponse(req, {
        error: formatEdgeError(openAiErr),
        step: "openai",
      }, 502);
    }

    let hooks: string[];
    try {
      hooks = parseHooksResponse(rawContent, 10);
    } catch (parseErr) {
      logEdgeError("hook-generator", parseErr, {
        phase: "parse",
        rawPreview: rawContent.slice(0, 400),
      });
      return jsonResponse(req, {
        error: formatEdgeError(parseErr),
        step: "parse",
      }, 502);
    }

    console.log("[hook-generator] parsed hooks", { count: hooks.length });

    const { data: saved, error: insertError } = await supabaseAdmin
      .from("generated_hooks")
      .insert({
        user_id: user.id,
        topic: input.topic.trim(),
        tone: input.tone,
        platform: input.platform,
        generated_hooks_json: hooks,
      })
      .select("id, topic, tone, platform, generated_hooks_json, created_at")
      .single();

    if (insertError) {
      logEdgeError("hook-generator", insertError, { phase: "save" });
      // Hooks were generated — return them so the UI still works; history sync is optional.
      return jsonResponse(req, {
        ok: true,
        hooks,
        generation: null,
        storageWarning: formatEdgeError(insertError),
        creditsUsed: skipCreditCharge ? 0 : hookCost,
      });
    }

    try {
      await recordAiGeneration(supabaseAdmin, {
        user_id: user.id,
        email: user.email ?? "",
        tool_used: "Hook Generator",
        generation_type: "text",
        niche: input.topic.trim(),
        platform: input.platform,
        prompt: input.topic.trim(),
        credits_used: skipCreditCharge ? 0 : hookCost,
        status: "completed",
      });
    } catch (analyticsErr) {
      console.warn("[hook-generator] analytics log failed", analyticsErr);
    }

    return jsonResponse(req, {
      ok: true,
      hooks,
      generation: saved,
      creditsUsed: skipCreditCharge ? 0 : hookCost,
    });
  } catch (err) {
    logEdgeError("hook-generator", err);
    return jsonResponse(req, { error: formatEdgeError(err) }, 500);
  }
});
