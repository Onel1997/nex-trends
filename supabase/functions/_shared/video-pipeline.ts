/** Structured pipeline steps + env checks for generate-video. */

export type PipelineStep =
  | "auth"
  | "env"
  | "queue"
  | "prompt"
  | "video_generation"
  | "audio_generation"
  | "upload"
  | "storage"
  | "compose"
  | "poll"
  | "history"

export type PipelineErrorBody = {
  ok: false
  error: string
  step: PipelineStep
  details?: Record<string, unknown>
}

export type EnvCheckResult = {
  supabaseUrl: boolean
  supabaseAnonKey: boolean
  supabaseServiceRoleKey: boolean
  replicateApiToken: boolean
  openaiApiKey: boolean
  lumaApiKey: boolean
  appOrigin: boolean
  storageBucket: string
  missingRequired: string[]
  providerMode: "replicate" | "luma" | "synthetic"
}

export function getStorageBucket(): string {
  const configured = Deno.env.get("VIDEO_STORAGE_BUCKET")?.trim()
  if (configured) return configured
  const legacy = Deno.env.get("AI_VIDEOS_BUCKET")?.trim()
  if (legacy) return legacy
  return "ai-videos"
}

export function checkPipelineEnv(): EnvCheckResult {
  const supabaseUrl = Boolean(Deno.env.get("SUPABASE_URL")?.trim())
  const supabaseAnonKey = Boolean(Deno.env.get("SUPABASE_ANON_KEY")?.trim())
  const supabaseServiceRoleKey = Boolean(
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim(),
  )
  const replicateApiToken = Boolean(Deno.env.get("REPLICATE_API_TOKEN")?.trim())
  const openaiApiKey = Boolean(Deno.env.get("OPENAI_API_KEY")?.trim())
  const lumaApiKey = Boolean(Deno.env.get("LUMA_API_KEY")?.trim())
  const appOrigin = Boolean(
    Deno.env.get("APP_ORIGIN")?.trim() || Deno.env.get("VITE_APP_URL")?.trim(),
  )

  const missingRequired: string[] = []
  if (!supabaseUrl) missingRequired.push("SUPABASE_URL")
  if (!supabaseAnonKey) missingRequired.push("SUPABASE_ANON_KEY")
  if (!supabaseServiceRoleKey) missingRequired.push("SUPABASE_SERVICE_ROLE_KEY")

  const providerMode = replicateApiToken
    ? "replicate"
    : lumaApiKey
    ? "luma"
    : "synthetic"

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    replicateApiToken,
    openaiApiKey,
    lumaApiKey,
    appOrigin,
    storageBucket: getStorageBucket(),
    missingRequired,
    providerMode,
  }
}

export function pipelineError(
  step: PipelineStep,
  message: string,
  details?: Record<string, unknown>,
): PipelineErrorBody {
  return { ok: false, error: message, step, details }
}

export function logPipeline(
  step: PipelineStep,
  event: string,
  detail?: Record<string, unknown>,
): void {
  console.log(
    `[generate-video][${step}] ${event}`,
    detail ? JSON.stringify(detail) : "",
  )
}
