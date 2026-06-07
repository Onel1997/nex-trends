DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN

    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS full_name text,
      ADD COLUMN IF NOT EXISTS avatar_url text,
      ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly',
      ADD COLUMN IF NOT EXISTS credits_reset_at timestamptz;

  END IF;
END $$;