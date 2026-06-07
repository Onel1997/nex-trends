import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { isAdminEmail } from "../_shared/admin.ts";
import { callOpenAI } from "../_shared/ai/openai-client.ts";
import {
  buildCodeSystemPrompt,
  buildCodeUserMessage,
  parseCodeResponse,
  validateCodeInput,
  type CodeFramework,
  type CodeGenerationInput,
  type CodeOutputType,
} from "../_shared/ai/prompts/code.ts";
import {
  checkRateLimit,
  rateLimitHeaders,
} from "../_shared/ai/rate-limit.ts";
import { corsHeadersFor, jsonHeadersFor } from "../_shared/cors.ts";
import { formatEdgeError, logEdgeError } from "../_shared/errors.ts";
import { ensureProfile } from "../_shared/usage.ts";

type Action = "generate" | "history" | "health";

type CodeRow = {
  id: string;
  user_id: string;
  project_description: string;
  framework: string;
  output_type: string;
  code_content: string;
  language: string;
  created_at: string;
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

function rowToGeneration(row: CodeRow) {
  return {
    id: row.id,
    projectDescription: row.project_description,
    framework: row.framework,
    outputType: row.output_type,
    code: row.code_content,
    language: row.language,
    createdAt: row.created_at,
  };
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

    if (!isAdminEmail(user.email)) {
      return jsonResponse(req, { error: "Nur für Admins verfügbar" }, 403);
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
        adminOnly: true,
      });
    }

    if (action === "history") {
      const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 50);

      const { data, error } = await supabaseAdmin
        .from("generated_code")
        .select(
          "id, user_id, project_description, framework, output_type, code_content, language, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const generations = ((data ?? []) as CodeRow[]).map(rowToGeneration);
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

    const input: CodeGenerationInput = {
      projectDescription: typeof body.projectDescription === "string"
        ? body.projectDescription
        : typeof body.project_description === "string"
          ? body.project_description
          : "",
      framework: (typeof body.framework === "string"
        ? body.framework
        : "React") as CodeFramework,
      outputType: (typeof body.outputType === "string"
        ? body.outputType
        : typeof body.output_type === "string"
          ? body.output_type
          : "Component") as CodeOutputType,
    };

    const validationError = validateCodeInput(input);
    if (validationError) {
      return jsonResponse(req, { error: validationError }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      return jsonResponse(req, {
        error:
          "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
        step: "env",
      }, 503);
    }

    const systemPrompt = buildCodeSystemPrompt(input.framework, input.outputType);
    const userMessage = buildCodeUserMessage(input);

    console.log("[code-generator] generating", {
      userId: user.id,
      framework: input.framework,
      outputType: input.outputType,
    });

    let rawContent: string;
    try {
      rawContent = await callOpenAI({
        systemPrompt,
        userMessage,
        temperature: 0.35,
        jsonMode: true,
        maxTokens: 4096,
      });
    } catch (openAiErr) {
      logEdgeError("code-generator", openAiErr, { phase: "openai" });
      return jsonResponse(req, {
        error: formatEdgeError(openAiErr),
        step: "openai",
      }, 502);
    }

    let parsed;
    try {
      parsed = parseCodeResponse(rawContent);
    } catch (parseErr) {
      logEdgeError("code-generator", parseErr, { phase: "parse" });
      return jsonResponse(req, {
        error: formatEdgeError(parseErr),
        step: "parse",
      }, 502);
    }

    const { data: savedRow, error: insertError } = await supabaseAdmin
      .from("generated_code")
      .insert({
        user_id: user.id,
        project_description: input.projectDescription.trim(),
        framework: input.framework,
        output_type: input.outputType,
        code_content: parsed.code,
        language: parsed.language,
      })
      .select(
        "id, user_id, project_description, framework, output_type, code_content, language, created_at",
      )
      .single();

    if (insertError) {
      logEdgeError("code-generator", insertError, { phase: "save" });
      return jsonResponse(req, {
        error: `Speichern fehlgeschlagen: ${formatEdgeError(insertError)}`,
        step: "storage",
        code: parsed.code,
        language: parsed.language,
        summary: parsed.summary,
      }, 500);
    }

    const generation = rowToGeneration(savedRow as CodeRow);

    return jsonResponse(req, {
      generation,
      code: generation.code,
      language: generation.language,
      summary: parsed.summary,
    });
  } catch (err) {
    logEdgeError("code-generator", err);
    return jsonResponse(req, { error: formatEdgeError(err) }, 500);
  }
});
