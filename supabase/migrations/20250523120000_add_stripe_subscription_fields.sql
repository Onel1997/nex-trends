DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN

    alter table public.profiles
      add column if not exists is_pro boolean not null default false,
      add column if not exists subscription_status text not null default 'inactive',
      add column if not exists stripe_customer_id text,
      add column if not exists stripe_subscription_id text;

  END IF;
END $$;