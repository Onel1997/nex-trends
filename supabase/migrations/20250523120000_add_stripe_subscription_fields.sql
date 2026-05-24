-- NexTrends: Stripe subscription fields on profiles
-- Run via: supabase db push  OR  SQL Editor in Supabase Dashboard

alter table public.profiles
  add column if not exists is_pro boolean not null default false,
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

alter table public.profiles
  drop constraint if exists profiles_subscription_status_check;

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (subscription_status in ('active', 'inactive'));

comment on column public.profiles.is_pro is 'True when user has an active Pro subscription';
comment on column public.profiles.subscription_status is 'active | inactive – synced from Stripe webhooks';
comment on column public.profiles.stripe_customer_id is 'Stripe Customer ID (cus_...)';
comment on column public.profiles.stripe_subscription_id is 'Stripe Subscription ID (sub_...)';

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

create unique index if not exists profiles_stripe_customer_id_unique
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_id_unique
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;
