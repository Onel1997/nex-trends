DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN

    comment on column public.profiles.monthly_usage_count is
    'Anzahl AI-Analysen im aktuellen Abrechnungsmonat';

  END IF;
END $$;