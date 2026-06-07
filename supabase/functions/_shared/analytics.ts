import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

export type GenerationType = "text" | "video" | "audio" | "search" | "image";
export type GenerationStatus = "queued" | "generating" | "completed" | "failed";

export type AiGenerationInput = {
  user_id: string;
  email: string;
  tool_used: string;
  generation_type?: GenerationType;
  status?: GenerationStatus;
  niche?: string;
  platform?: string;
  prompt?: string;
  credits_used?: number;
  output_url?: string;
  error_message?: string;
};

export async function recordAiGeneration(
  admin: SupabaseClient,
  input: AiGenerationInput,
): Promise<{ ok: boolean; skipped?: boolean; id?: string }> {
  const row: Record<string, unknown> = {
    user_id: input.user_id,
    email: (input.email ?? "").slice(0, 320),
    tool_used: (input.tool_used ?? "unknown").slice(0, 120),
    generation_type: (input.generation_type ?? "text").slice(0, 32),
    status: (input.status ?? "completed").slice(0, 24),
    niche: (input.niche ?? "").slice(0, 200),
    platform: (input.platform ?? "").slice(0, 120),
    prompt: (input.prompt ?? "").slice(0, 4000),
    credits_used: Math.max(0, Math.floor(input.credits_used ?? 1)),
    output_url: input.output_url?.slice(0, 2000) ?? null,
    error_message: input.error_message?.slice(0, 500) ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin.from("ai_generations").insert(row).select("id")
    .maybeSingle();

  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (
      msg.includes("does not exist") ||
      msg.includes("could not find") ||
      msg.includes("generation_type") ||
      msg.includes("status") ||
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      error.code === "42703"
    ) {
      const { generation_type: _gt, status: _st, output_url: _ou, error_message: _em, updated_at: _ua, ...legacy } = row;
      const legacyInsert = await admin.from("ai_generations").insert(legacy).select("id")
        .maybeSingle();
      if (legacyInsert.error) {
        console.warn("[analytics] ai_generations legacy insert:", legacyInsert.error.message);
        return { ok: false, skipped: true };
      }
      console.log("[analytics] recorded (legacy schema)", legacyInsert.data?.id);
      return { ok: true, id: legacyInsert.data?.id as string | undefined };
    }
    console.warn("[analytics] recordAiGeneration:", error.message);
    return { ok: false, skipped: true };
  }

  console.log("[analytics] recorded", data?.id, row.generation_type, row.status);
  return { ok: true, id: data?.id as string | undefined };
}

export async function updateAiGenerationStatus(
  admin: SupabaseClient,
  id: string,
  patch: {
    status: GenerationStatus;
    output_url?: string;
    error_message?: string;
  },
): Promise<{ ok: boolean }> {
  const updates: Record<string, unknown> = {
    status: patch.status,
    updated_at: new Date().toISOString(),
  };
  if (patch.output_url !== undefined) updates.output_url = patch.output_url;
  if (patch.error_message !== undefined) updates.error_message = patch.error_message;

  const { error } = await admin.from("ai_generations").update(updates).eq("id", id);
  if (error) {
    console.warn("[analytics] updateAiGenerationStatus:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export type AnalyticsPeriod = "24h" | "7d" | "30d";

export function periodToSince(period: AnalyticsPeriod): string {
  const hours = period === "24h" ? 24 : period === "7d" ? 24 * 7 : 24 * 30;
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
