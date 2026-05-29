import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const action = (body.action ?? "generate") as Action;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const profile = await ensureProfile(supabaseAdmin, user.id, user.email);

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
        ...(openaiKey ? {} : {
          error:
            "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
        }),
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
      return jsonResponse(req, {
        error: `Speichern fehlgeschlagen: ${formatEdgeError(insertError)}`,
        step: "storage",
        hooks,
      }, 500);
    }

    return jsonResponse(req, {
      hooks,
      generation: saved,
    });
  } catch (err) {
    logEdgeError("hook-generator", err);
    return jsonResponse(req, { error: formatEdgeError(err) }, 500);
  }
});
