export type OpenAIChatOptions = {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
};

function buildChatBody(options: OpenAIChatOptions) {
  const model =
    Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";

  const body: Record<string, unknown> = {
    model,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    messages: [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userMessage },
    ],
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  return body;
}

async function requestOpenAI(body: Record<string, unknown>) {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY fehlt. Setze das Secret im Supabase Dashboard unter Edge Functions → Secrets.",
    );
  }

  const model = typeof body.model === "string" ? body.model : "unknown";
  console.log("[openai-client] request", {
    model,
    jsonMode: body.response_format != null,
    messageCount: Array.isArray(body.messages) ? body.messages.length : 0,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    let detail = errText;
    try {
      const parsed = JSON.parse(errText) as {
        error?: { message?: string; type?: string; code?: string };
      };
      const apiErr = parsed.error;
      detail = apiErr?.message ??
        (apiErr?.code ? `${apiErr.code}` : errText);
    } catch {
      /* use raw text */
    }
    console.error("[openai-client] API error", {
      status: response.status,
      model,
      detail: detail.slice(0, 500),
    });
    throw new Error(`OpenAI API Fehler (${response.status}): ${detail}`);
  }

  return await response.json();
}

export async function callOpenAI(
  options: OpenAIChatOptions,
): Promise<string> {
  const data = await requestOpenAI(buildChatBody(options));

  const content =
    data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    const finishReason = data?.choices?.[0]?.finish_reason;
    console.error("[openai-client] empty content", { finishReason });
    throw new Error(
      finishReason
        ? `Keine Antwort von OpenAI (finish_reason: ${finishReason}).`
        : "Keine Antwort von OpenAI.",
    );
  }

  return content;
}

export async function callOpenAIJson<T>(
  options: OpenAIChatOptions,
): Promise<T> {
  const content = await callOpenAI({
    ...options,
    jsonMode: true,
  });

  return JSON.parse(content) as T;
}