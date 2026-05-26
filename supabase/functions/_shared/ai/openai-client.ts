export type OpenAIChatOptions = {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
};

async function requestOpenAI(body: Record<string, unknown>) {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY fehlt.");
  }

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
    throw new Error(`OpenAI API Fehler: ${errText}`);
  }

  return await response.json();
}

export async function callOpenAI(
  options: OpenAIChatOptions,
): Promise<string> {
  const model =
    Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";

  const data = await requestOpenAI({
    model,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    response_format: options.jsonMode
      ? { type: "json_object" }
      : undefined,
    messages: [
      {
        role: "system",
        content: options.systemPrompt,
      },
      {
        role: "user",
        content: options.userMessage,
      },
    ],
  });

  const content =
    data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Keine Antwort von OpenAI.");
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