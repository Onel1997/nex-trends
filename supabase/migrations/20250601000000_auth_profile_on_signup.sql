-- Sync profiles from auth.users on signup and when OAuth metadata updates.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN

    CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $fn$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        COALESCE(NEW.created_at, now())
      )
      ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

      RETURN NEW;
    END;
    $fn$;

    DROP TRIGGER IF EXISTS on_auth_user_sync_profile ON auth.users;

    CREATE TRIGGER on_auth_user_sync_profile
      AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_profile_from_auth_user();

  END IF;
END $$;
