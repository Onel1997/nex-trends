-- Real-time analytics: ai_generations, analytics_daily, platform_stats

-- ---------------------------------------------------------------------------
-- ai_generations — one row per AI action
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

-- ---------------------------------------------------------------------------
-- analytics_daily — daily rollups for charts
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
-- platform_stats — cumulative platform usage
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_stats (
  platform text PRIMARY KEY,
  generation_count int NOT NULL DEFAULT 0,
  credits_consumed int NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Rollup trigger on new generations
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
-- RLS — no direct client writes; edge functions use service role
-- ---------------------------------------------------------------------------
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read only their own generations (optional product feature)
CREATE POLICY "Users read own ai_generations"
  ON public.ai_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated on rollup tables

-- ---------------------------------------------------------------------------
-- Demo seed data (last 30 days)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  demo_tools text[] := ARRAY[
    'Trend-Scouting', 'Hook Generator', 'Ad Copy', 'SEO Titles', 'Landing Analyzer'
  ];
  demo_niches text[] := ARRAY[
    'Fitness', 'Crypto', 'Beauty', 'E-Commerce', 'Gaming', 'Finance', 'Travel', 'Food'
  ];
  demo_platforms text[] := ARRAY[
    'TikTok', 'Instagram', 'YouTube', 'Alle Plattformen'
  ];
  demo_emails text[] := ARRAY[
    'demo@nextrends.app', 'creator@nextrends.app', 'pro@nextrends.app',
    'scout@nextrends.app', 'growth@nextrends.app'
  ];
  i int;
  v_ts timestamptz;
  v_tool text;
  v_niche text;
  v_plat text;
  v_email text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.ai_generations g
    WHERE g.email LIKE '%@nextrends.app'
    LIMIT 1
  ) THEN
    RETURN;
  END IF;

  FOR i IN 1..120 LOOP
    v_ts := now() - (random() * interval '30 days');
    v_tool := demo_tools[1 + floor(random() * array_length(demo_tools, 1))::int];
    v_niche := demo_niches[1 + floor(random() * array_length(demo_niches, 1))::int];
    v_plat := demo_platforms[1 + floor(random() * array_length(demo_platforms, 1))::int];
    v_email := demo_emails[1 + floor(random() * array_length(demo_emails, 1))::int];

    INSERT INTO public.ai_generations (
      user_id, email, tool_used, niche, platform, prompt, credits_used, created_at
    ) VALUES (
      NULL,
      v_email,
      v_tool,
      v_niche,
      v_plat,
      'Demo prompt for ' || v_niche || ' on ' || v_plat,
      1 + floor(random() * 2)::int,
      v_ts
    );
  END LOOP;

  INSERT INTO public.analytics_daily (day, total_generations, credits_consumed, active_users)
  SELECT
    (g.created_at AT TIME ZONE 'UTC')::date AS day,
    count(*)::int,
    coalesce(sum(g.credits_used), 0)::int,
    count(DISTINCT g.user_id)::int
  FROM public.ai_generations g
  WHERE g.email LIKE '%@nextrends.app'
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
  WHERE g.platform <> '' AND g.email LIKE '%@nextrends.app'
  GROUP BY g.platform
  ON CONFLICT (platform) DO UPDATE SET
    generation_count = EXCLUDED.generation_count,
    credits_consumed = EXCLUDED.credits_consumed,
    last_used_at = EXCLUDED.last_used_at,
    updated_at = now();
END $$;
