-- AI-generated short-form videos per user (Replicate / Luma / fallback)

CREATE TABLE IF NOT EXISTS public.generated_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  generation_id uuid REFERENCES public.ai_generations (id) ON DELETE SET NULL,
  trend_id text,
  provider text NOT NULL DEFAULT 'replicate',
  external_job_id text,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'generating', 'processing', 'completed', 'failed')),
  prompt text,
  scene_prompt text,
  hook_text text,
  captions jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  poster_url text,
  voiceover_url text,
  music_url text,
  duration text,
  aspect_ratio text NOT NULL DEFAULT '9:16',
  has_audio boolean NOT NULL DEFAULT true,
  retry_count int NOT NULL DEFAULT 0,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_videos_user_created_idx
  ON public.generated_videos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS generated_videos_status_idx
  ON public.generated_videos (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS generated_videos_external_job_idx
  ON public.generated_videos (external_job_id)
  WHERE external_job_id IS NOT NULL;

ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY generated_videos_select_own
  ON public.generated_videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY generated_videos_insert_own
  ON public.generated_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY generated_videos_update_own
  ON public.generated_videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for persisted generated MP4s
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-videos',
  'generated-videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY generated_videos_storage_select
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'generated-videos');

CREATE POLICY generated_videos_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'generated-videos'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY generated_videos_storage_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'generated-videos'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );
