DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN

    alter table public.profiles
      add column if not exists monthly_usage_count integer not null default 0,
      add column if not exists usage_reset_date timestamptz;

  END IF;
END $$;