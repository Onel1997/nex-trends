-- Idempotent repair: ensure analytics tables, columns, triggers, and policies exist.
-- Safe to run when 20250526100000 / 20250526120000 were partially applied or skipped.

-- ---------------------------------------------------------------------------
-- ai_generations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  email text NOT NULL DEFAULT '',
  tool_used text NOT NULL DEFAULT 'unknown',
  niche text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT '',
  prompt text NOT NULL DEFAULT '',
  credits_used int NOT NULL DEFAULT 1 CHECK (credits_used >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generations
  ADD COLUMN IF NOT EXISTS generation_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS output_url text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS ai_generations_created_at_idx
  ON public.ai_generations (created_at DESC);

CREATE INDEX IF NOT EXISTS ai_generations_user_created_idx
  ON public.ai_generations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_generations_tool_created_idx
  ON public.ai_generations (tool_used, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_generations_niche_created_idx
  ON public.ai_generations (niche, created_at DESC)
  WHERE niche <> '';

CREATE INDEX IF NOT EXISTS ai_generations_platform_created_idx
  ON public.ai_generations (platform, created_at DESC)
  WHERE platform <> '';

CREATE INDEX IF NOT EXISTS ai_generations_status_created_idx
  ON public.ai_generations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_generations_type_created_idx
  ON public.ai_generations (generation_type, created_at DESC);

-- ---------------------------------------------------------------------------
-- analytics_daily
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  day date PRIMARY KEY,
  total_generations int NOT NULL DEFAULT 0,
  credits_consumed int NOT NULL DEFAULT 0,
  active_users int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_daily_day_desc_idx
  ON public.analytics_daily (day DESC);

-- ---------------------------------------------------------------------------
-- platform_stats
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_stats (
  platform text PRIMARY KEY,
  generation_count int NOT NULL DEFAULT 0,
  credits_consumed int NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Rollup trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_analytics_from_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  day_key date := (NEW.created_at AT TIME ZONE 'UTC')::date;
  plat text := NULLIF(trim(NEW.platform), '');
BEGIN
  INSERT INTO public.analytics_daily (day, total_generations, credits_consumed, active_users)
  VALUES (day_key, 1, NEW.credits_used, 1)
  ON CONFLICT (day) DO UPDATE SET
    total_generations = analytics_daily.total_generations + 1,
    credits_consumed = analytics_daily.credits_consumed + NEW.credits_used,
    updated_at = now();

  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.analytics_daily ad
    SET active_users = (
      SELECT count(DISTINCT g.user_id)::int
      FROM public.ai_generations g
      WHERE (g.created_at AT TIME ZONE 'UTC')::date = day_key
        AND g.user_id IS NOT NULL
    ),
    updated_at = now()
    WHERE ad.day = day_key;
  END IF;

  IF plat IS NOT NULL THEN
    INSERT INTO public.platform_stats (platform, generation_count, credits_consumed, last_used_at)
    VALUES (plat, 1, NEW.credits_used, NEW.created_at)
    ON CONFLICT (platform) DO UPDATE SET
      generation_count = platform_stats.generation_count + 1,
      credits_consumed = platform_stats.credits_consumed + NEW.credits_used,
      last_used_at = GREATEST(platform_stats.last_used_at, NEW.created_at),
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ai_generations_sync_analytics ON public.ai_generations;
CREATE TRIGGER ai_generations_sync_analytics
  AFTER INSERT ON public.ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_analytics_from_generation();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own ai_generations" ON public.ai_generations;
CREATE POLICY "Users read own ai_generations"
  ON public.ai_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypasses RLS; no client write policies on rollup tables.

-- ---------------------------------------------------------------------------
-- Backfill analytics_daily from existing rows (no-op if empty)
-- ---------------------------------------------------------------------------
INSERT INTO public.analytics_daily (day, total_generations, credits_consumed, active_users)
SELECT
  (g.created_at AT TIME ZONE 'UTC')::date AS day,
  count(*)::int,
  coalesce(sum(g.credits_used), 0)::int,
  count(DISTINCT g.user_id)::int
FROM public.ai_generations g
GROUP BY (g.created_at AT TIME ZONE 'UTC')::date
ON CONFLICT (day) DO UPDATE SET
  total_generations = EXCLUDED.total_generations,
  credits_consumed = EXCLUDED.credits_consumed,
  active_users = EXCLUDED.active_users,
  updated_at = now();

INSERT INTO public.platform_stats (platform, generation_count, credits_consumed, last_used_at)
SELECT
  g.platform,
  count(*)::int,
  coalesce(sum(g.credits_used), 0)::int,
  max(g.created_at)
FROM public.ai_generations g
WHERE g.platform <> ''
GROUP BY g.platform
ON CONFLICT (platform) DO UPDATE SET
  generation_count = EXCLUDED.generation_count,
  credits_consumed = EXCLUDED.credits_consumed,
  last_used_at = EXCLUDED.last_used_at,
  updated_at = now();
