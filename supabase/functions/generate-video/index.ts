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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

type Action = "create" | "poll" | "history" | "retry";

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

async function uploadBytes(
  supabaseAdmin: ReturnType<typeof createClient>,
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string | null> {
  const { error } = await supabaseAdmin.storage
    .from("generated-videos")
    .upload(path, bytes, { contentType, upsert: true });

  if (error) {
    console.warn("[generate-video] upload failed", error.message);
    return null;
  }

  const { data } = supabaseAdmin.storage.from("generated-videos").getPublicUrl(
    path,
  );
  return data.publicUrl ?? null;
}

async function persistRemoteVideo(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  jobId: string,
  remoteUrl: string,
): Promise<string> {
  try {
    const bytes = await downloadToBytes(remoteUrl);
    const storagePath = `${userId}/${jobId}.mp4`;
    const stored = await uploadBytes(
      supabaseAdmin,
      storagePath,
      bytes,
      "video/mp4",
    );
    if (stored) return stored;
  } catch (err) {
    console.warn("[generate-video] persist remote failed", err);
  }
  return remoteUrl;
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
      return new Response(JSON.stringify({ error: "User nicht gefunden" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "create") as Action;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
        const videoUrl = await persistRemoteVideo(
          supabaseAdmin,
          user.id,
          jobId,
          polled.outputUrl,
        );

        const voiceBytes = await synthesizeVoiceover(
          row.hook_text ?? "",
          jobId,
        );
        let voiceoverUrl: string | null = null;
        if (voiceBytes) {
          voiceoverUrl = await uploadBytes(
            supabaseAdmin,
            `${user.id}/${jobId}-voice.mp3`,
            voiceBytes,
            "audio/mpeg",
          );
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
        await supabaseAdmin.from("generated_videos").update({
          status: "failed",
          error_message: polled.error ?? "Provider-Fehler",
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

    const brief = await resolveVideoBrief({
      trendId: trendId || crypto.randomUUID(),
      title,
      niche: body.niche,
      platform: body.platform,
      description: body.description,
      hookText: body.hook_text,
      contentBreakdown: body.content_breakdown,
      generationNonce: crypto.randomUUID(),
    });

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
        },
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      throw insertErr ?? new Error("Insert fehlgeschlagen");
    }

    const providerJob = await startVideoProviderJob(brief.scenePrompt, "9:16");

    if (providerJob.provider === "synthetic") {
      const clip = hashPick(SYNTHETIC_CLIPS, `${user.id}:${inserted.id}`);
      const poster = SYNTHETIC_POSTERS[clip] ?? "";
      const base = appOrigin.replace(/\/$/, "");
      const videoUrl = base ? `${base}${clip}` : clip;

      const voiceBytes = await synthesizeVoiceover(brief.hookText, inserted.id);
      let voiceoverUrl: string | null = null;
      if (voiceBytes) {
        voiceoverUrl = await uploadBytes(
          supabaseAdmin,
          `${user.id}/${inserted.id}-voice.mp3`,
          voiceBytes,
          "audio/mpeg",
        );
      }

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
          note: "Set REPLICATE_API_TOKEN or LUMA_API_KEY for true AI video",
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
      const videoUrl = await persistRemoteVideo(
        supabaseAdmin,
        user.id,
        inserted.id,
        providerJob.outputUrl,
      );

      await supabaseAdmin.from("generated_videos").update({
        status: "completed",
        video_url: videoUrl,
        has_audio: true,
        updated_at: new Date().toISOString(),
      }).eq("id", inserted.id);
    }

    const { data: finalRow } = await supabaseAdmin.from("generated_videos")
      .select("*").eq("id", inserted.id).single();

    return new Response(JSON.stringify({
      ok: true,
      job: formatJobRow(finalRow ?? inserted, appOrigin),
    }), { headers: jsonHeaders });
  } catch (err) {
    console.error("[generate-video]", err);
    const message = err instanceof Error ? err.message : "Interner Fehler";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});

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
