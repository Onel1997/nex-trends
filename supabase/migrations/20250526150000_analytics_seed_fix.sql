-- Repair: re-run demo seed + rollups if prior migration failed on ambiguous PL/pgSQL vars.
-- Idempotent — skips when demo rows already exist.

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
