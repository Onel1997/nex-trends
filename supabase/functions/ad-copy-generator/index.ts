import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { callOpenAI } from "../_shared/ai/openai-client.ts";
import {
  buildAdCopySystemPrompt,
  buildAdCopyUserMessage,
  parseAdCopyResponse,
  validateAdCopyInput,
  type AdCopyGenerationInput,
  type AdCopyItem,
} from "../_shared/ai/prompts/ad-copy.ts";
import {
  checkRateLimit,
  rateLimitHeaders,
} from "../_shared/ai/rate-limit.ts";
import { ensureProfile } from "../_shared/usage.ts";
import { corsHeadersFor, jsonHeadersFor } from "../_shared/cors.ts";
import { formatEdgeError, logEdgeError } from "../_shared/errors.ts";

type Action = "generate" | "history" | "health";

type AdCopyRow = {
  id: string;
  user_id: string;
  generation_batch_id: string;
  briefing: string;
  tone: string;
  platform: string;
  headline: string;
  primary_text: string;
  cta: string;
  character_count: number;
  is_saved: boolean;
  created_at: string;
};

type AdCopyBatch = {
  id: string;
  briefing: string;
  tone: string;
  platform: string;
  created_at: string;
  variants: Array<{
    id: string;
    headline: string;
    primaryText: string;
    cta: string;
    character_count: number;
    is_saved: boolean;
  }>;
};

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

function charCount(ad: AdCopyItem): number {
  return ad.headline.length + ad.primaryText.length + ad.cta.length;
}

function groupRowsIntoBatches(rows: AdCopyRow[]): AdCopyBatch[] {
  const byBatch = new Map<string, AdCopyRow[]>();

  for (const row of rows) {
    const batchId = row.generation_batch_id || row.id;
    const list = byBatch.get(batchId) ?? [];
    list.push(row);
    byBatch.set(batchId, list);
  }

  const batches: AdCopyBatch[] = [];

  for (const [batchId, batchRows] of byBatch) {
    const sorted = [...batchRows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const first = sorted[0];
    batches.push({
      id: batchId,
      briefing: first.briefing,
      tone: first.tone,
      platform: first.platform,
      created_at: first.created_at,
      variants: sorted.map((row) => ({
        id: row.id,
        headline: row.headline,
        primaryText: row.primary_text,
        cta: row.cta,
        character_count: row.character_count,
        is_saved: row.is_saved,
      })),
    });
  }

  return batches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function batchFromRows(rows: AdCopyRow[]): AdCopyBatch | null {
  if (rows.length === 0) return null;
  return groupRowsIntoBatches(rows)[0] ?? null;
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
      const batchLimit = Math.min(
        Math.max(Number(body.limit) || 20, 1),
        50,
      );

      const { data, error } = await supabaseAdmin
        .from("generated_ad_copy")
        .select(
          "id, user_id, generation_batch_id, briefing, tone, platform, headline, primary_text, cta, character_count, is_saved, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(batchLimit * 5);

      if (error) throw error;

      const generations = groupRowsIntoBatches((data ?? []) as AdCopyRow[]).slice(
        0,
        batchLimit,
      );

      return jsonResponse(req, { generations, rows: data ?? [] });
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

    const input: AdCopyGenerationInput = {
      briefing: typeof body.briefing === "string" ? body.briefing : "",
      tone: typeof body.tone === "string" ? body.tone : "aggressive",
      platform: typeof body.platform === "string" ? body.platform : "Meta Ads",
    };

    const validationError = validateAdCopyInput(input);
    if (validationError) {
      return jsonResponse(req, { error: validationError }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      console.error("[ad-copy-generator] OPENAI_API_KEY missing");
      return jsonResponse(req, {
        error:
          "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
        step: "env",
      }, 503);
    }

    const systemPrompt = buildAdCopySystemPrompt(input.tone, input.platform);
    const userMessage = buildAdCopyUserMessage(input);

    console.log("[ad-copy-generator] generating", {
      userId: user.id,
      briefing: input.briefing.slice(0, 40),
      tone: input.tone,
      platform: input.platform,
      model: Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini",
    });

    let rawContent: string;
    try {
      rawContent = await callOpenAI({
        systemPrompt,
        userMessage,
        temperature: 0.72,
        jsonMode: true,
      });
    } catch (openAiErr) {
      logEdgeError("ad-copy-generator", openAiErr, { phase: "openai" });
      return jsonResponse(req, {
        error: formatEdgeError(openAiErr),
        step: "openai",
      }, 502);
    }

    let ads: AdCopyItem[];
    try {
      ads = parseAdCopyResponse(rawContent, 5);
    } catch (parseErr) {
      logEdgeError("ad-copy-generator", parseErr, {
        phase: "parse",
        rawPreview: rawContent.slice(0, 400),
      });
      return jsonResponse(req, {
        error: formatEdgeError(parseErr),
        step: "parse",
      }, 502);
    }

    console.log("[ad-copy-generator] parsed ads", { count: ads.length });

    const batchId = crypto.randomUUID();
    const insertRows = ads.map((ad) => ({
      user_id: user.id,
      generation_batch_id: batchId,
      briefing: input.briefing.trim(),
      tone: input.tone,
      platform: input.platform,
      headline: ad.headline,
      primary_text: ad.primaryText,
      cta: ad.cta,
      character_count: charCount(ad),
      is_saved: false,
    }));

    const { data: savedRows, error: insertError } = await supabaseAdmin
      .from("generated_ad_copy")
      .insert(insertRows)
      .select(
        "id, user_id, generation_batch_id, briefing, tone, platform, headline, primary_text, cta, character_count, is_saved, created_at",
      );

    if (insertError) {
      logEdgeError("ad-copy-generator", insertError, { phase: "save" });
      return jsonResponse(req, {
        error: `Speichern fehlgeschlagen: ${formatEdgeError(insertError)}`,
        step: "storage",
        variants: ads,
      }, 500);
    }

    const generation = batchFromRows((savedRows ?? []) as AdCopyRow[]);

    return jsonResponse(req, {
      variants: generation?.variants ?? ads.map((ad, index) => ({
        id: `unsaved-${index}`,
        headline: ad.headline,
        primaryText: ad.primaryText,
        cta: ad.cta,
        character_count: charCount(ad),
        is_saved: false,
      })),
      generation,
      rows: savedRows ?? [],
    });
  } catch (err) {
    logEdgeError("ad-copy-generator", err);
    return jsonResponse(req, { error: formatEdgeError(err) }, 500);
  }
});
