DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN

    alter table public.profiles
      add column if not exists credit_balance integer,
      add column if not exists last_weekly_refill_at timestamptz;

  END IF;
END $$;