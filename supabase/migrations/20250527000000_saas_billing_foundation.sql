-- NexTrends SaaS billing foundation: plans, subscriptions, usage_logs, profile.plan

-- ── Plans catalog ──
create table if not exists public.plans (
  id text primary key,
  name text not null,
  monthly_price integer not null default 0,
  yearly_price integer not null default 0,
  credits integer,
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.plans (id, name, monthly_price, yearly_price, credits, features, sort_order)
values
  (
    'free',
    'Free',
    0,
    0,
    10,
    '["limited_trend_search","basic_tools","watermark_exports"]'::jsonb,
    0
  ),
  (
    'creator',
    'Creator',
    19,
    15,
    50,
    '["hd_exports","saved_trends","hook_generator","seo_tools","ad_copy"]'::jsonb,
    1
  ),
  (
    'pro_creator',
    'Pro Creator',
    49,
    39,
    null,
    '["unlimited_trends","ai_video_studio","voiceovers","captions","premium_templates","priority_queue"]'::jsonb,
    2
  ),
  (
    'studio',
    'Studio',
    99,
    79,
    null,
    '["team_workspace","shared_assets","brand_presets","analytics","multi_workspace"]'::jsonb,
    3
  ),
  (
    'agency',
    'Agency',
    199,
    159,
    null,
    '["api_access","white_label","client_management","team_roles","unlimited_projects"]'::jsonb,
    4
  ),
  (
    'founder',
    'Founder',
    0,
    0,
    null,
    '["internal_admin","unlimited_everything"]'::jsonb,
    5
  )
on conflict (id) do update set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  yearly_price = excluded.yearly_price,
  credits = excluded.credits,
  features = excluded.features,
  sort_order = excluded.sort_order;

-- ── Profile extensions ──
alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists billing_period text default 'monthly',
  add column if not exists credits_reset_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (
    plan in ('free', 'creator', 'pro_creator', 'studio', 'agency', 'founder')
  );

alter table public.profiles
  drop constraint if exists profiles_credit_balance_range;

alter table public.profiles
  add constraint profiles_credit_balance_nonneg
  check (credit_balance >= 0);

comment on column public.profiles.plan is 'SaaS plan tier synced from Stripe + admin';
comment on column public.profiles.credit_balance is 'Remaining AI credits (usage_logs source of truth for history)';

update public.profiles
set plan = case
  when is_pro = true and subscription_status = 'active' then 'pro_creator'
  else coalesce(plan, 'free')
end
where plan is null or plan = 'free';

-- Sync email / name from auth
update public.profiles p
set
  email = coalesce(p.email, u.email),
  full_name = coalesce(
    p.full_name,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  avatar_url = coalesce(p.avatar_url, u.raw_user_meta_data->>'avatar_url')
from auth.users u
where u.id = p.id;

-- ── Subscriptions (Stripe mirror) ──
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_subscription_id text not null,
  stripe_price_id text,
  plan text not null references public.plans (id),
  status text not null default 'inactive',
  billing_period text not null default 'monthly',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

-- ── Usage logs ──
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  credits_used integer not null default 1 check (credits_used >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_logs_user_created_idx
  on public.usage_logs (user_id, created_at desc);

create index if not exists usage_logs_action_idx
  on public.usage_logs (action);

-- ── RLS ──
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_logs enable row level security;

drop policy if exists "Anyone can read plans" on public.plans;
create policy "Anyone can read plans"
  on public.plans for select
  to authenticated, anon
  using (true);

drop policy if exists "Users read own subscriptions" on public.subscriptions;
create policy "Users read own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users read own usage logs" on public.usage_logs;
create policy "Users read own usage logs"
  on public.usage_logs for select
  to authenticated
  using (auth.uid() = user_id);

-- Service role writes via edge functions only (no insert policy for users)

-- ── Signup trigger: plan + profile fields ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    plan,
    credit_balance,
    monthly_usage_count,
    last_weekly_refill_at,
    usage_reset_date,
    is_pro,
    subscription_status,
    created_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    'free',
    10,
    0,
    now(),
    now() + interval '7 days',
    false,
    'inactive',
    now()
  )
  on conflict (id) do update set
    email = coalesce(public.profiles.email, excluded.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;
