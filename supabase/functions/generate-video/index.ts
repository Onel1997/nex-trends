import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";
import { resolveVideoBrief } from "../_shared/video-prompt.ts";
import {
  pickBackgroundMusic,
  synthesizeVoiceover,
} from "../_shared/video-audio.ts";
import {
  downloadToBytes,
  pollVideoProviderJob,
  startVideoProviderJob,
} from "../_shared/video-provider.ts";
import { consumeCredits } from "../_shared/credits.ts";
import { ensureProfile } from "../_shared/usage.ts";
import {
  checkPipelineEnv,
  getStorageBucket,
  logPipeline,
  pipelineError,
  type PipelineStep,
} from "../_shared/video-pipeline.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

type Action = "create" | "poll" | "history" | "retry" | "health" | "library" | "delete";

const SYNTHETIC_CLIPS = [
  "/demo-videos/demo-1.mp4",
  "/demo-videos/demo-2.mp4",
  "/demo-videos/demo-3.mp4",
  "/demo-videos/demo-4.mp4",
] as const;

const SYNTHETIC_POSTERS: Record<string, string> = {
  "/demo-videos/demo-1.mp4": "/demo-videos/demo-1-poster.jpg",
  "/demo-videos/demo-2.mp4": "/demo-videos/demo-2-poster.jpg",
  "/demo-videos/demo-3.mp4": "/demo-videos/demo-3-poster.jpg",
  "/demo-videos/demo-4.mp4": "/demo-videos/demo-4-poster.jpg",
};

function hashPick<T>(arr: readonly T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

function jsonError(
  step: PipelineStep,
  message: string,
  status = 500,
  details?: Record<string, unknown>,
): Response {
  logPipeline(step, "error", { message, ...details })
  return new Response(
    JSON.stringify(pipelineError(step, message, details)),
    { status, headers: jsonHeaders },
  )
}

async function uploadBytes(
  supabaseAdmin: ReturnType<typeof createClient>,
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<{ url: string | null; error?: string; bucket: string }> {
  const bucket = getStorageBucket()
  const bucketsToTry = bucket === "generated-videos"
    ? [bucket]
    : [bucket, "generated-videos", "ai-videos"]

  for (const tryBucket of [...new Set(bucketsToTry)]) {
    const { error } = await supabaseAdmin.storage
      .from(tryBucket)
      .upload(path, bytes, { contentType, upsert: true })

    if (error) {
      logPipeline("upload", "bucket failed", {
        bucket: tryBucket,
        message: error.message,
        path,
      })
      continue
    }

    const { data } = supabaseAdmin.storage.from(tryBucket).getPublicUrl(path)
    logPipeline("storage", "upload ok", {
      bucket: tryBucket,
      path,
      bytes: bytes.byteLength,
      contentType,
    })
    return { url: data.publicUrl ?? null, bucket: tryBucket }
  }

  return {
    url: null,
    error: `Storage upload failed for buckets: ${bucketsToTry.join(", ")}`,
    bucket,
  }
}

async function persistRemoteVideo(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  jobId: string,
  remoteUrl: string,
): Promise<{ url: string; storageError?: string }> {
  try {
    logPipeline("compose", "download remote video", { jobId, remoteUrl })
    const bytes = await downloadToBytes(remoteUrl);
    const storagePath = `${userId}/${jobId}.mp4`;
    const stored = await uploadBytes(
      supabaseAdmin,
      storagePath,
      bytes,
      "video/mp4",
    );
    if (stored.url) return { url: stored.url };
    return {
      url: remoteUrl,
      storageError: stored.error ?? "Upload returned no URL",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logPipeline("compose", "persist remote failed", { jobId, message })
    return { url: remoteUrl, storageError: message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Nicht authentifiziert" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    const appOrigin = Deno.env.get("APP_ORIGIN")?.trim() ||
      Deno.env.get("VITE_APP_URL")?.trim() || "";

    const envCheck = checkPipelineEnv();
    logPipeline("env", "check", {
      ...envCheck,
      replicateApiToken: envCheck.replicateApiToken ? "[set]" : "[missing]",
      openaiApiKey: envCheck.openaiApiKey ? "[set]" : "[missing]",
      lumaApiKey: envCheck.lumaApiKey ? "[set]" : "[missing]",
    });

    if (envCheck.missingRequired.length > 0) {
      return jsonError(
        "env",
        `Supabase-Umgebungsvariablen fehlen: ${envCheck.missingRequired.join(", ")}`,
        500,
        { missing: envCheck.missingRequired },
      );
    }

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonError("env", "Supabase-Umgebungsvariablen fehlen", 500);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user?.id) {
      return new Response(JSON.stringify({ error: "User nicht gefunden" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "create") as Action;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    if (action === "health") {
      return new Response(
        JSON.stringify({
          ok: true,
          env: {
            ...envCheck,
            replicateApiToken: envCheck.replicateApiToken,
            openaiApiKey: envCheck.openaiApiKey,
            lumaApiKey: envCheck.lumaApiKey,
          },
        }),
        { headers: jsonHeaders },
      );
    }

    if (action === "history") {
      const limit = Math.min(Number(body.limit) || 20, 50);
      const { data, error } = await supabaseAdmin
        .from("generated_videos")
        .select(
          "id, trend_id, status, video_url, poster_url, hook_text, captions, voiceover_url, music_url, duration, provider, created_at, error_message",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, items: data ?? [] }), {
        headers: jsonHeaders,
      });
    }

    if (action === "library") {
      const limit = Math.min(Number(body.limit) || 50, 100);
      const platformFilter = typeof body.platform === "string"
        ? body.platform.trim()
        : "";
      const statusFilter = typeof body.status === "string"
        ? body.status.trim()
        : "";

      let genQuery = supabaseAdmin
        .from("ai_generations")
        .select(
          "id, tool_used, niche, platform, prompt, credits_used, status, output_url, created_at, updated_at, generated_videos ( id, status, video_url, poster_url, hook_text, captions, voiceover_url, music_url, duration, trend_id, provider, error_message )",
        )
        .eq("user_id", user.id)
        .eq("generation_type", "video")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (platformFilter) {
        genQuery = genQuery.ilike("platform", platformFilter);
      }
      if (statusFilter) {
        genQuery = genQuery.eq("status", statusFilter);
      }

      const { data: generations, error: genErr } = await genQuery;
      if (genErr) throw genErr;

      const items = (generations ?? []).map((row) =>
        formatLibraryRow(row as Record<string, unknown>, appOrigin)
      );

      const seenJobIds = new Set(
        items.map((i) => i.jobId).filter(Boolean) as string[],
      );

      const { data: orphanJobs } = await supabaseAdmin
        .from("generated_videos")
        .select(
          "id, trend_id, status, video_url, poster_url, hook_text, captions, voiceover_url, music_url, duration, provider, created_at, error_message, metadata",
        )
        .eq("user_id", user.id)
        .is("generation_id", null)
        .order("created_at", { ascending: false })
        .limit(20);

      for (const job of orphanJobs ?? []) {
        if (seenJobIds.has(job.id)) continue;
        const meta = (job.metadata ?? {}) as Record<string, string>;
        if (
          platformFilter &&
          !String(meta.platform ?? "").toLowerCase().includes(
            platformFilter.toLowerCase(),
          )
        ) {
          continue;
        }
        if (statusFilter && job.status !== statusFilter) continue;
        items.push(formatOrphanJobRow(job, appOrigin));
      }

      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return new Response(JSON.stringify({ ok: true, items }), {
        headers: jsonHeaders,
      });
    }

    if (action === "delete") {
      const generationId = typeof body.generation_id === "string"
        ? body.generation_id
        : "";
      const jobId = typeof body.job_id === "string" ? body.job_id : "";

      if (!generationId && !jobId) {
        return new Response(JSON.stringify({ error: "generation_id oder job_id fehlt" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      const urlsToRemove: string[] = [];

      if (jobId) {
        const { data: job } = await supabaseAdmin
          .from("generated_videos")
          .select("id, video_url, poster_url, voiceover_url, user_id")
          .eq("id", jobId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (job) {
          if (job.video_url) urlsToRemove.push(job.video_url);
          if (job.poster_url) urlsToRemove.push(job.poster_url);
          if (job.voiceover_url) urlsToRemove.push(job.voiceover_url);
          await supabaseAdmin.from("generated_videos").delete().eq("id", jobId);
        }
      }

      if (generationId) {
        const { data: linkedJobs } = await supabaseAdmin
          .from("generated_videos")
          .select("id, video_url, poster_url, voiceover_url")
          .eq("generation_id", generationId)
          .eq("user_id", user.id);

        for (const job of linkedJobs ?? []) {
          if (job.video_url) urlsToRemove.push(job.video_url);
          if (job.poster_url) urlsToRemove.push(job.poster_url);
          if (job.voiceover_url) urlsToRemove.push(job.voiceover_url);
          await supabaseAdmin.from("generated_videos").delete().eq("id", job.id);
        }

        await supabaseAdmin
          .from("ai_generations")
          .delete()
          .eq("id", generationId)
          .eq("user_id", user.id);
      }

      for (const url of [...new Set(urlsToRemove)]) {
        const parsed = parseStorageObject(url);
        if (parsed) {
          await supabaseAdmin.storage.from(parsed.bucket).remove([parsed.path]);
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: jsonHeaders,
      });
    }

    if (action === "poll" || action === "retry") {
      const jobId = String(body.job_id ?? "");
      if (!jobId) {
        return new Response(JSON.stringify({ error: "job_id fehlt" }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      const { data: row, error: fetchErr } = await supabaseAdmin
        .from("generated_videos")
        .select("*")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchErr || !row) {
        return new Response(JSON.stringify({ error: "Job nicht gefunden" }), {
          status: 404,
          headers: jsonHeaders,
        });
      }

      if (action === "retry" && row.status === "failed") {
        await supabaseAdmin.from("generated_videos").update({
          status: "queued",
          retry_count: (row.retry_count ?? 0) + 1,
          error_message: null,
          updated_at: new Date().toISOString(),
        }).eq("id", jobId);

        const brief = await resolveVideoBrief({
          trendId: row.trend_id ?? jobId,
          title: row.hook_text ?? "Trend Video",
          niche: row.metadata?.niche,
          platform: row.metadata?.platform,
          hookText: row.hook_text,
          generationNonce: crypto.randomUUID(),
        });

        const providerJob = await startVideoProviderJob(
          brief.scenePrompt,
          row.aspect_ratio ?? "9:16",
        );

        await supabaseAdmin.from("generated_videos").update({
          status: "generating",
          provider: providerJob.provider,
          external_job_id: providerJob.id,
          scene_prompt: brief.scenePrompt,
          hook_text: brief.hookText,
          captions: brief.captions,
          prompt: brief.scenePrompt,
          updated_at: new Date().toISOString(),
        }).eq("id", jobId);

        return new Response(JSON.stringify({
          ok: true,
          job: { id: jobId, status: "generating", provider: providerJob.provider },
        }), { headers: jsonHeaders });
      }

      if (row.status === "completed" || row.status === "failed") {
        return new Response(JSON.stringify({
          ok: true,
          job: formatJobRow(row, appOrigin),
        }), { headers: jsonHeaders });
      }

      if (!row.external_job_id) {
        return new Response(JSON.stringify({
          ok: true,
          job: formatJobRow(row, appOrigin),
        }), { headers: jsonHeaders });
      }

      const polled = await pollVideoProviderJob({
        id: row.external_job_id,
        provider: row.provider ?? "replicate",
      });

      if (polled.status === "succeeded" && polled.outputUrl) {
        logPipeline("poll", "provider succeeded", {
          jobId,
          provider: row.provider,
          outputUrl: polled.outputUrl,
        })

        const persisted = await persistRemoteVideo(
          supabaseAdmin,
          user.id,
          jobId,
          polled.outputUrl,
        );
        const videoUrl = persisted.url

        const voiceBytes = await synthesizeVoiceover(
          row.hook_text ?? "",
          jobId,
        );
        let voiceoverUrl: string | null = null;
        if (voiceBytes) {
          const voiceUpload = await uploadBytes(
            supabaseAdmin,
            `${user.id}/${jobId}-voice.mp3`,
            voiceBytes,
            "audio/mpeg",
          );
          voiceoverUrl = voiceUpload.url
          if (!voiceoverUrl) {
            logPipeline("audio_generation", "voice upload skipped", {
              error: voiceUpload.error,
            })
          }
        }

        const musicUrl = row.music_url ?? pickBackgroundMusic(
          row.metadata?.visualMood ?? "",
          jobId,
        );

        await supabaseAdmin.from("generated_videos").update({
          status: "completed",
          video_url: videoUrl,
          voiceover_url: voiceoverUrl,
          music_url: musicUrl,
          has_audio: true,
          updated_at: new Date().toISOString(),
        }).eq("id", jobId);

        const { data: updated } = await supabaseAdmin.from("generated_videos")
          .select("*").eq("id", jobId).single();

        return new Response(JSON.stringify({
          ok: true,
          job: formatJobRow(updated ?? row, appOrigin),
        }), { headers: jsonHeaders });
      }

      if (polled.status === "failed") {
        const providerErr = polled.error ?? "Provider-Fehler"
        logPipeline("video_generation", "provider failed", {
          jobId,
          error: providerErr,
        })
        await supabaseAdmin.from("generated_videos").update({
          status: "failed",
          error_message: `[video_generation] ${providerErr}`,
          updated_at: new Date().toISOString(),
        }).eq("id", jobId);
      } else {
        await supabaseAdmin.from("generated_videos").update({
          status: polled.status === "starting" ? "queued" : "generating",
          updated_at: new Date().toISOString(),
        }).eq("id", jobId);
      }

      const { data: refreshed } = await supabaseAdmin.from("generated_videos")
        .select("*").eq("id", jobId).single();

      return new Response(JSON.stringify({
        ok: true,
        job: formatJobRow(refreshed ?? row, appOrigin),
      }), { headers: jsonHeaders });
    }

    // create
    const trendId = String(body.trend_id ?? "");
    const title = String(body.title ?? "Trend Video");
    const generationId = typeof body.generation_id === "string"
      ? body.generation_id
      : null;

    await ensureProfile(supabaseAdmin, user.id, user.email);

    const idempotencyKey = typeof body.idempotency_key === "string"
      ? body.idempotency_key
      : generationId
      ? `video:${generationId}`
      : undefined;

    const creditResult = await consumeCredits(supabaseAdmin, user.id, {
      feature: "ai_video",
      metadata: {
        trend_id: trendId,
        generation_id: generationId,
        title,
      },
      idempotencyKey,
      email: user.email,
    });

    if (!creditResult.allowed) {
      logPipeline("queue", "insufficient credits", { userId: user.id, trendId });
      return new Response(
        JSON.stringify({
          ...creditResult,
          error: creditResult.error ?? "insufficient_credits",
        }),
        { status: 402, headers: jsonHeaders },
      );
    }

    logPipeline("queue", "create job", { trendId, userId: user.id, cost: creditResult.cost })

    let brief
    try {
      brief = await resolveVideoBrief({
        trendId: trendId || crypto.randomUUID(),
        title,
        niche: body.niche,
        platform: body.platform,
        description: body.description,
        hookText: body.hook_text,
        contentBreakdown: body.content_breakdown,
        generationNonce: crypto.randomUUID(),
      })
      logPipeline("prompt", "brief ready", {
        hookText: brief.hookText.slice(0, 80),
        pacing: brief.pacing,
      })
    } catch (briefErr) {
      const message = briefErr instanceof Error ? briefErr.message : String(briefErr)
      return jsonError("prompt", `Prompt-Erstellung fehlgeschlagen: ${message}`, 500)
    }

    const musicUrl = pickBackgroundMusic(brief.visualMood, trendId || title);

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("generated_videos")
      .insert({
        user_id: user.id,
        generation_id: generationId,
        trend_id: trendId || null,
        status: "queued",
        prompt: brief.scenePrompt,
        scene_prompt: brief.scenePrompt,
        hook_text: brief.hookText,
        captions: brief.captions,
        music_url: musicUrl,
        aspect_ratio: "9:16",
        metadata: {
          niche: body.niche,
          platform: body.platform,
          pacing: brief.pacing,
          motionStyle: brief.motionStyle,
          visualMood: brief.visualMood,
          studio_style: body.studio_style,
          studio_duration: body.studio_duration,
          enable_voiceover: body.enable_voiceover !== false,
          enable_captions: body.enable_captions !== false,
        },
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      return jsonError(
        "queue",
        insertErr?.message ?? "Datenbank-Insert fehlgeschlagen",
        500,
        { code: insertErr?.code },
      )
    }

    logPipeline("video_generation", "start provider", {
      jobId: inserted.id,
      mode: envCheck.providerMode,
    })

    const providerJob = await startVideoProviderJob(brief.scenePrompt, "9:16");

    logPipeline("video_generation", "provider job", {
      jobId: inserted.id,
      provider: providerJob.provider,
      status: providerJob.status,
      externalId: providerJob.id,
      error: providerJob.error,
    })

    if (providerJob.provider === "synthetic") {
      const clip = hashPick(SYNTHETIC_CLIPS, `${user.id}:${inserted.id}`);
      const poster = SYNTHETIC_POSTERS[clip] ?? "";
      const base = appOrigin.replace(/\/$/, "");
      const videoUrl = base ? `${base}${clip}` : clip;

      const voiceBytes = await synthesizeVoiceover(brief.hookText, inserted.id);
      let voiceoverUrl: string | null = null;
      if (voiceBytes) {
        const voiceUpload = await uploadBytes(
          supabaseAdmin,
          `${user.id}/${inserted.id}-voice.mp3`,
          voiceBytes,
          "audio/mpeg",
        );
        voiceoverUrl = voiceUpload.url
      }

      logPipeline("compose", "synthetic complete", {
        jobId: inserted.id,
        videoUrl,
        voiceoverUrl,
        appOrigin: base || "(relative)",
      })

      await supabaseAdmin.from("generated_videos").update({
        status: "completed",
        provider: "synthetic",
        video_url: videoUrl,
        poster_url: base ? `${base}${poster}` : poster,
        voiceover_url: voiceoverUrl,
        duration: "0:15",
        has_audio: Boolean(voiceoverUrl),
        metadata: {
          ...inserted.metadata,
          synthetic: true,
          storage_bucket: getStorageBucket(),
          note: envCheck.replicateApiToken
            ? "Synthetic fallback"
            : "Set REPLICATE_API_TOKEN or LUMA_API_KEY for true AI video",
        },
        updated_at: new Date().toISOString(),
      }).eq("id", inserted.id);

      const { data: done } = await supabaseAdmin.from("generated_videos")
        .select("*").eq("id", inserted.id).single();

      return new Response(JSON.stringify({
        ok: true,
        job: formatJobRow(done ?? inserted, appOrigin),
      }), { headers: jsonHeaders });
    }

    await supabaseAdmin.from("generated_videos").update({
      status: providerJob.status === "succeeded" ? "processing" : "generating",
      provider: providerJob.provider,
      external_job_id: providerJob.id,
      updated_at: new Date().toISOString(),
    }).eq("id", inserted.id);

    if (providerJob.status === "succeeded" && providerJob.outputUrl) {
      const persisted = await persistRemoteVideo(
        supabaseAdmin,
        user.id,
        inserted.id,
        providerJob.outputUrl,
      );

      await supabaseAdmin.from("generated_videos").update({
        status: "completed",
        video_url: persisted.url,
        has_audio: true,
        error_message: persisted.storageError
          ? `[storage] ${persisted.storageError}`
          : null,
        updated_at: new Date().toISOString(),
      }).eq("id", inserted.id);
    }

    if (providerJob.status === "failed") {
      return jsonError(
        "video_generation",
        providerJob.error ?? "Video-Provider hat den Job abgelehnt",
        502,
        { provider: providerJob.provider, externalJobId: providerJob.id },
      )
    }

    const { data: finalRow } = await supabaseAdmin.from("generated_videos")
      .select("*").eq("id", inserted.id).single();

    return new Response(JSON.stringify({
      ok: true,
      job: formatJobRow(finalRow ?? inserted, appOrigin),
    }), { headers: jsonHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Interner Fehler";
    console.error("[generate-video][unknown]", err);
    return jsonError("compose", message, 500, {
      type: err instanceof Error ? err.name : "unknown",
    });
  }
});

function parseStorageObject(
  url: string,
): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/,
    );
    if (!match) return null;
    return { bucket: match[1], path: decodeURIComponent(match[2]) };
  } catch {
    return null;
  }
}

function formatLibraryRow(
  row: Record<string, unknown>,
  appOrigin: string,
) {
  const jobs = Array.isArray(row.generated_videos)
    ? row.generated_videos
    : row.generated_videos
    ? [row.generated_videos]
    : [];
  const job = (jobs[0] ?? {}) as Record<string, unknown>;
  const jobFormatted = Object.keys(job).length
    ? formatJobRow(job, appOrigin)
    : null;

  let videoUrl = (jobFormatted?.videoUrl ?? row.output_url) as string | undefined;
  let posterUrl = jobFormatted?.posterUrl as string | undefined;
  if (videoUrl?.startsWith("/") && appOrigin) {
    videoUrl = `${appOrigin.replace(/\/$/, "")}${videoUrl}`;
  }
  if (posterUrl?.startsWith("/") && appOrigin) {
    posterUrl = `${appOrigin.replace(/\/$/, "")}${posterUrl}`;
  }

  const prompt = String(row.prompt ?? "");
  const hookText = (jobFormatted?.hookText ?? prompt) as string;

  return {
    id: row.id,
    generationId: row.id,
    jobId: jobFormatted?.id ?? null,
    title: hookText.slice(0, 80) || prompt.slice(0, 80) || "AI Video",
    hookText,
    niche: String(row.niche ?? ""),
    platform: String(row.platform ?? ""),
    status: String(row.status ?? jobFormatted?.status ?? "queued"),
    creditsUsed: Number(row.credits_used ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    duration: jobFormatted?.duration ?? "0:15",
    videoUrl: videoUrl ?? null,
    posterUrl: posterUrl ?? null,
    captions: jobFormatted?.captions ?? [],
    voiceoverUrl: jobFormatted?.voiceoverUrl ?? null,
    musicUrl: jobFormatted?.musicUrl ?? null,
    provider: jobFormatted?.provider ?? null,
    trendId: jobFormatted?.trendId ?? null,
    errorMessage: jobFormatted?.errorMessage ?? row.error_message ?? null,
  };
}

function formatOrphanJobRow(
  row: Record<string, unknown>,
  appOrigin: string,
) {
  const job = formatJobRow(row, appOrigin);
  const meta = (row.metadata ?? {}) as Record<string, string>;
  return {
    id: `job-${row.id}`,
    generationId: null,
    jobId: job.id,
    title: (job.hookText ?? "AI Video").slice(0, 80),
    hookText: job.hookText,
    niche: meta.niche ?? "",
    platform: meta.platform ?? "",
    status: job.status,
    creditsUsed: 0,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    duration: job.duration,
    videoUrl: job.videoUrl ?? null,
    posterUrl: job.posterUrl ?? null,
    captions: job.captions,
    voiceoverUrl: job.voiceoverUrl,
    musicUrl: job.musicUrl,
    provider: job.provider,
    trendId: job.trendId,
    errorMessage: job.errorMessage,
  };
}

function formatJobRow(
  row: Record<string, unknown>,
  appOrigin: string,
) {
  let videoUrl = row.video_url as string | undefined;
  let posterUrl = row.poster_url as string | undefined;

  if (videoUrl?.startsWith("/") && appOrigin) {
    videoUrl = `${appOrigin.replace(/\/$/, "")}${videoUrl}`;
  }
  if (posterUrl?.startsWith("/") && appOrigin) {
    posterUrl = `${appOrigin.replace(/\/$/, "")}${posterUrl}`;
  }

  return {
    id: row.id,
    status: row.status,
    provider: row.provider,
    videoUrl,
    posterUrl,
    hookText: row.hook_text,
    captions: row.captions ?? [],
    voiceoverUrl: row.voiceover_url,
    musicUrl: row.music_url,
    duration: row.duration ?? "0:15",
    hasAudio: row.has_audio ?? true,
    errorMessage: row.error_message,
    trendId: row.trend_id,
    createdAt: row.created_at,
  };
}
