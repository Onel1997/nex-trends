-- Extend ai_generations for typed async pipeline (video, text, audio, search)

ALTER TABLE public.ai_generations
  ADD COLUMN IF NOT EXISTS generation_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS output_url text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS ai_generations_status_created_idx
  ON public.ai_generations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_generations_type_created_idx
  ON public.ai_generations (generation_type, created_at DESC);
