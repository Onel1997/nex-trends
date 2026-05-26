DO $$
BEGIN
  -- Nur ausführen wenn plans existiert
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'plans'
  ) THEN

    -- Beispielhafte sichere Updates
    UPDATE public.plans
    SET monthly_credits = 10
    WHERE slug = 'free';

  END IF;
END $$;