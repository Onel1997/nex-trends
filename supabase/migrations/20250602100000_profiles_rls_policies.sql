-- RLS policies for public.profiles — allow authenticated users to read/upsert their own row.
-- Profile rows are also created by sync_profile_from_auth_user() (SECURITY DEFINER trigger).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
    CREATE POLICY "Users read own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
    CREATE POLICY "Users insert own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
    CREATE POLICY "Users update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

  END IF;
END $$;
