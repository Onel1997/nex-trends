import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { callOpenAI } from "../_shared/ai/openai-client.ts";
import {
  buildSeoTitleSystemPrompt,
  buildSeoTitleUserMessage,
  parseSeoTitleResponse,
  validateSeoTitleInput,
  type SeoTitleGenerationInput,
  type SeoTitleItem,
} from "../_shared/ai/prompts/seo-title.ts";
import {
  checkRateLimit,
  rateLimitHeaders,
} from "../_shared/ai/rate-limit.ts";
import { ensureProfile } from "../_shared/usage.ts";
import { corsHeadersFor, jsonHeadersFor } from "../_shared/cors.ts";
import { formatEdgeError, logEdgeError } from "../_shared/errors.ts";
import { generateId } from "../_shared/generate-id.ts";

type Action = "generate" | "history" | "health";

type SeoTitleRow = {
  id: string;
  user_id: string;
  generation_batch_id: string;
  briefing: string;
  keyword: string;
  platform: string;
  search_intent: string;
  title_text: string;
  seo_score: number;
  ctr_score: number;
  readability_score: number;
  character_count: number;
  is_saved: boolean;
  created_at: string;
};

type SeoTitleBatch = {
  id: string;
  briefing: string;
  keyword: string;
  platform: string;
  search_intent: string;
  created_at: string;
  variants: Array<{
    id: string;
    title: string;
    seoScore: number;
    ctrScore: number;
    readabilityScore: number;
    keyword: string;
    searchIntent: string;
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

function charCount(item: SeoTitleItem): number {
  return item.title.length;
}

function rowToVariant(row: SeoTitleRow) {
  return {
    id: row.id,
    title: row.title_text,
    seoScore: row.seo_score,
    ctrScore: row.ctr_score,
    readabilityScore: row.readability_score,
    keyword: row.keyword,
    searchIntent: row.search_intent,
    character_count: row.character_count,
    is_saved: row.is_saved,
  };
}

function groupRowsIntoBatches(rows: SeoTitleRow[]): SeoTitleBatch[] {
  const byBatch = new Map<string, SeoTitleRow[]>();

  for (const row of rows) {
    const batchId = row.generation_batch_id || row.id;
    const list = byBatch.get(batchId) ?? [];
    list.push(row);
    byBatch.set(batchId, list);
  }

  const batches: SeoTitleBatch[] = [];

  for (const [batchId, batchRows] of byBatch) {
    const sorted = [...batchRows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const first = sorted[0];
    batches.push({
      id: batchId,
      briefing: first.briefing,
      keyword: first.keyword,
      platform: first.platform,
      search_intent: first.search_intent,
      created_at: first.created_at,
      variants: sorted.map(rowToVariant),
    });
  }

  return batches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function batchFromRows(rows: SeoTitleRow[]): SeoTitleBatch | null {
  if (rows.length === 0) return null;
  return groupRowsIntoBatches(rows)[0] ?? null;
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
    const profile = await ensureProfile(supabaseAdmin, user.id, user.email);

    if (profile.is_banned) {
      return jsonResponse(req, { error: "Account gesperrt" }, 403);
    }

    if (action === "health") {
      const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
      const model = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4.1-mini";
      return jsonResponse(req, {
        ok: true,
        openai: Boolean(openaiKey),
        model,
      });
    }

    if (action === "history") {
      const batchLimit = Math.min(Math.max(Number(body.limit) || 20, 1), 50);

      const { data, error } = await supabaseAdmin
        .from("generated_seo_titles")
        .select(
          "id, user_id, generation_batch_id, briefing, keyword, platform, search_intent, title_text, seo_score, ctr_score, readability_score, character_count, is_saved, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(batchLimit * 5);

      if (error) throw error;

      const generations = groupRowsIntoBatches((data ?? []) as SeoTitleRow[]).slice(
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
        { error: rateCheck.reason, retryAfterMs: rateCheck.retryAfterMs },
        429,
        rateLimitHeaders(rateCheck.retryAfterMs),
      );
    }

    const input: SeoTitleGenerationInput = {
      briefing: typeof body.briefing === "string" ? body.briefing : "",
      keyword: typeof body.keyword === "string" ? body.keyword : "",
      platform: typeof body.platform === "string" ? body.platform : "Google Search",
      searchIntent: typeof body.searchIntent === "string"
        ? body.searchIntent
        : typeof body.search_intent === "string"
          ? body.search_intent
          : "informational",
    };

    const validationError = validateSeoTitleInput(input);
    if (validationError) {
      return jsonResponse(req, { error: validationError }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      return jsonResponse(req, {
        error: "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard.",
        step: "env",
      }, 503);
    }

    const systemPrompt = buildSeoTitleSystemPrompt(
      input.platform,
      input.searchIntent ?? "informational",
    );
    const userMessage = buildSeoTitleUserMessage(input);

    let rawContent: string;
    try {
      rawContent = await callOpenAI({
        systemPrompt,
        userMessage,
        temperature: 0.68,
        jsonMode: true,
      });
    } catch (openAiErr) {
      logEdgeError("seo-title-generator", openAiErr, { phase: "openai" });
      return jsonResponse(req, { error: formatEdgeError(openAiErr), step: "openai" }, 502);
    }

    let titles: SeoTitleItem[];
    try {
      titles = parseSeoTitleResponse(rawContent, 5);
    } catch (parseErr) {
      logEdgeError("seo-title-generator", parseErr, { phase: "parse" });
      return jsonResponse(req, { error: formatEdgeError(parseErr), step: "parse" }, 502);
    }

    const batchId = generateId();
    const keywordDefault = input.keyword?.trim() || input.briefing.trim().slice(0, 40);

    const insertRows = titles.map((item) => ({
      user_id: user.id,
      generation_batch_id: batchId,
      briefing: input.briefing.trim(),
      keyword: item.keyword || keywordDefault,
      platform: input.platform,
      search_intent: item.searchIntent,
      title_text: item.title,
      seo_score: item.seoScore,
      ctr_score: item.ctrScore,
      readability_score: item.readabilityScore,
      character_count: charCount(item),
      is_saved: false,
    }));

    const { data: savedRows, error: insertError } = await supabaseAdmin
      .from("generated_seo_titles")
      .insert(insertRows)
      .select(
        "id, user_id, generation_batch_id, briefing, keyword, platform, search_intent, title_text, seo_score, ctr_score, readability_score, character_count, is_saved, created_at",
      );

    if (insertError) {
      logEdgeError("seo-title-generator", insertError, { phase: "save" });
      return jsonResponse(req, {
        error: `Speichern fehlgeschlagen: ${formatEdgeError(insertError)}`,
        step: "storage",
        variants: titles,
      }, 500);
    }

    const generation = batchFromRows((savedRows ?? []) as SeoTitleRow[]);

    return jsonResponse(req, {
      variants: generation?.variants ?? titles.map((item, index) => ({
        id: `unsaved-${index}`,
        ...item,
        character_count: charCount(item),
        is_saved: false,
      })),
      generation,
      rows: savedRows ?? [],
    });
  } catch (err) {
    logEdgeError("seo-title-generator", err);
    return jsonResponse(req, { error: formatEdgeError(err) }, 500);
  }
});
