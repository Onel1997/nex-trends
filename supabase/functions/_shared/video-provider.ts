/** AI video providers: Replicate (Minimax) primary, Luma fallback. */

export type ProviderJobStatus = "starting" | "processing" | "succeeded" | "failed" | "canceled"

export type ProviderJob = {
  id: string
  provider: "replicate" | "luma" | "synthetic"
  status: ProviderJobStatus
  outputUrl?: string
  error?: string
}

const REPLICATE_MODEL = "minimax/video-01-live"
const LUMA_API = "https://api.lumalabs.ai/dream-machine/v1/generations"

async function startReplicate(
  prompt: string,
  aspectRatio: string,
): Promise<ProviderJob | null> {
  const token = Deno.env.get("REPLICATE_API_TOKEN")?.trim()
  if (!token) return null

  const res = await fetch(
    `https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt,
          prompt_optimizer: true,
          aspect_ratio: aspectRatio === "9:16" ? "9:16" : "16:9",
        },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    console.error("[video-provider][video_generation] Replicate start failed", {
      status: res.status,
      body: err.slice(0, 2000),
      model: REPLICATE_MODEL,
    })
    return null
  }

  const data = await res.json() as {
    id?: string
    status?: string
    output?: string | string[]
    error?: string
  }

  const output = Array.isArray(data.output) ? data.output[0] : data.output

  console.log("[video-provider][video_generation] Replicate response", {
    id: data.id,
    status: data.status,
    hasOutput: Boolean(output),
    error: data.error,
  })

  return {
    id: data.id ?? crypto.randomUUID(),
    provider: "replicate",
    status: mapReplicateStatus(data.status),
    outputUrl: typeof output === "string" ? output : undefined,
    error: data.error,
  }
}

async function pollReplicate(predictionId: string): Promise<ProviderJob> {
  const token = Deno.env.get("REPLICATE_API_TOKEN")?.trim()
  if (!token) {
    return { id: predictionId, provider: "replicate", status: "failed", error: "No token" }
  }

  const res = await fetch(
    `https://api.replicate.com/v1/predictions/${predictionId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!res.ok) {
    const err = await res.text()
    console.error("[video-provider][poll] Replicate poll failed", {
      status: res.status,
      body: err.slice(0, 1500),
      predictionId,
    })
    return {
      id: predictionId,
      provider: "replicate",
      status: "failed",
      error: `Replicate poll HTTP ${res.status}`,
    }
  }

  const data = await res.json() as {
    id?: string
    status?: string
    output?: string | string[]
    error?: string
  }

  const output = Array.isArray(data.output) ? data.output[0] : data.output

  console.log("[video-provider][poll] Replicate status", {
    predictionId,
    status: data.status,
    hasOutput: Boolean(output),
    error: data.error,
  })

  return {
    id: predictionId,
    provider: "replicate",
    status: mapReplicateStatus(data.status),
    outputUrl: typeof output === "string" ? output : undefined,
    error: typeof data.error === "string" ? data.error : undefined,
  }
}

function mapReplicateStatus(s?: string): ProviderJobStatus {
  if (s === "succeeded") return "succeeded"
  if (s === "failed" || s === "canceled") return "failed"
  if (s === "starting") return "starting"
  return "processing"
}

async function startLuma(
  prompt: string,
  aspectRatio: string,
): Promise<ProviderJob | null> {
  const key = Deno.env.get("LUMA_API_KEY")?.trim()
  if (!key) return null

  const res = await fetch(LUMA_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio === "9:16" ? "9:16" : "16:9",
      loop: false,
    }),
  })

  if (!res.ok) {
    console.warn("[video-provider] Luma start failed", res.status)
    return null
  }

  const data = await res.json() as {
    id?: string
    state?: string
    assets?: { video?: string }
    failure_reason?: string
  }

  return {
    id: data.id ?? crypto.randomUUID(),
    provider: "luma",
    status: mapLumaStatus(data.state),
    outputUrl: data.assets?.video,
    error: data.failure_reason,
  }
}

async function pollLuma(generationId: string): Promise<ProviderJob> {
  const key = Deno.env.get("LUMA_API_KEY")?.trim()
  if (!key) {
    return { id: generationId, provider: "luma", status: "failed", error: "No key" }
  }

  const res = await fetch(`${LUMA_API}/${generationId}`, {
    headers: { Authorization: `Bearer ${key}` },
  })

  const data = await res.json() as {
    id?: string
    state?: string
    assets?: { video?: string }
    failure_reason?: string
  }

  return {
    id: generationId,
    provider: "luma",
    status: mapLumaStatus(data.state),
    outputUrl: data.assets?.video,
    error: data.failure_reason,
  }
}

function mapLumaStatus(s?: string): ProviderJobStatus {
  if (s === "completed") return "succeeded"
  if (s === "failed") return "failed"
  if (s === "queued" || s === "dreaming") return "processing"
  return "processing"
}

export async function startVideoProviderJob(
  prompt: string,
  aspectRatio = "9:16",
): Promise<ProviderJob> {
  const replicate = await startReplicate(prompt, aspectRatio)
  if (replicate) return replicate

  const luma = await startLuma(prompt, aspectRatio)
  if (luma) return luma

  return {
    id: `synthetic-${crypto.randomUUID()}`,
    provider: "synthetic",
    status: "succeeded",
    outputUrl: undefined,
  }
}

export async function pollVideoProviderJob(job: {
  id: string
  provider: string
}): Promise<ProviderJob> {
  if (job.provider === "replicate") return pollReplicate(job.id)
  if (job.provider === "luma") return pollLuma(job.id)
  return {
    id: job.id,
    provider: "synthetic",
    status: "succeeded",
  }
}

export async function downloadToBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return new Uint8Array(await res.arrayBuffer())
}
