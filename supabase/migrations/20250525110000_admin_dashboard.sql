DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN

    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS banned_at timestamptz;

  END IF;
END $$;