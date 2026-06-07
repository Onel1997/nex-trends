-- AI video storage bucket (alias for generated-videos pipeline)
-- Code uses VIDEO_STORAGE_BUCKET env or defaults to ai-videos.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-videos',
  'ai-videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS ai_videos_storage_select ON storage.objects;
DROP POLICY IF EXISTS ai_videos_storage_insert ON storage.objects;
DROP POLICY IF EXISTS ai_videos_storage_update_own ON storage.objects;

CREATE POLICY ai_videos_storage_select
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ai-videos');

CREATE POLICY ai_videos_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ai-videos'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );

CREATE POLICY ai_videos_storage_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ai-videos'
    AND (storage.foldername (name))[1] = auth.uid()::text
  );
