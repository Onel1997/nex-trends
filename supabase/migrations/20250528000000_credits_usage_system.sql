-- NexTrends Credits & Usage Tracking — production schema + atomic RPCs
-- Run after 20250527000000_saas_billing_foundation.sql

-- ── Plan monthly credit limits (source of truth for resets) ──
update public.plans set credits = 25 where id = 'free';
update public.plans set credits = 250 where id = 'creator';
update public.plans set credits = 1000 where id = 'pro_creator';
update public.plans set credits = 5000 where id = 'studio';
update public.plans set credits = null where id in ('agency', 'founder');

insert into public.plans (id, name, monthly_price, yearly_price, credits, features, sort_order)
values
  ('free', 'Free', 0, 0, 25, '["limited_trend_search","basic_tools","watermark_exports"]'::jsonb, 0),
  ('creator', 'Creator', 19, 15, 250, '["hd_exports","saved_trends","hook_generator","seo_tools","ad_copy"]'::jsonb, 1),
  ('pro_creator', 'Pro Creator', 49, 39, 1000, '["ai_video_studio","voiceovers","captions","premium_templates","priority_queue"]'::jsonb, 2),
  ('studio', 'Studio', 99, 79, 5000, '["team_workspace","shared_assets","brand_presets","analytics","multi_workspace"]'::jsonb, 3),
  ('agency', 'Agency', 199, 159, null, '["api_access","white_label","client_management","team_roles","unlimited_projects"]'::jsonb, 4),
  ('founder', 'Founder', 0, 0, null, '["internal_admin","unlimited_everything"]'::jsonb, 5)
on conflict (id) do update set
  credits = excluded.credits,
  features = excluded.features;

-- ── Profile extensions (PAYG / team / admin bonus prep) ──
alter table public.profiles
  add column if not exists bonus_credits integer not null default 0,
  add column if not exists workspace_id uuid;

alter table public.profiles
  drop constraint if exists profiles_bonus_credits_nonneg;

alter table public.profiles
  add constraint profiles_bonus_credits_nonneg check (bonus_credits >= 0);

comment on column public.profiles.bonus_credits is 'Extra credits (admin grants, PAYG packs) — spent after monthly allowance';
comment on column public.profiles.workspace_id is 'Future: shared workspace for team credit pools';

-- ── usage_logs enhancements ──
alter table public.usage_logs
  add column if not exists feature text,
  add column if not exists balance_after integer,
  add column if not exists idempotency_key text,
  add column if not exists workspace_id uuid;

create unique index if not exists usage_logs_idempotency_idx
  on public.usage_logs (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists usage_logs_feature_idx
  on public.usage_logs (feature);

comment on column public.usage_logs.feature is 'Canonical UsageActionId (trend_search, ai_video, …)';
comment on column public.usage_logs.balance_after is 'credit_balance after deduction (null if unlimited)';
comment on column public.usage_logs.idempotency_key is 'Client-supplied key to prevent double-charge on retries';

-- ── Credit adjustments ledger (admin bonus, PAYG, refunds) ──
create table if not exists public.credit_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workspace_id uuid,
  amount integer not null,
  reason text not null check (
    reason in (
      'admin_bonus',
      'payg_purchase',
      'promo',
      'refund',
      'subscription_grant',
      'migration'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_adjustments_user_created_idx
  on public.credit_adjustments (user_id, created_at desc);

alter table public.credit_adjustments enable row level security;

drop policy if exists "Users read own credit adjustments" on public.credit_adjustments;
create policy "Users read own credit adjustments"
  on public.credit_adjustments for select
  to authenticated
  using (auth.uid() = user_id);

-- ── Future team wallets (placeholder) ──
create table if not exists public.credit_wallets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_user_id uuid references auth.users (id) on delete set null,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  monthly_allowance integer,
  credits_reset_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists credit_wallets_workspace_idx
  on public.credit_wallets (workspace_id);

alter table public.credit_wallets enable row level security;

-- No user policies yet — service role only until team billing ships

-- ── Valid usage actions (DB guard) ──
alter table public.usage_logs
  drop constraint if exists usage_logs_action_valid;

alter table public.usage_logs
  add constraint usage_logs_action_valid check (
    action in (
      'trend_search',
      'hook_generation',
      'seo_title',
      'ad_copy',
      'landing_analysis',
      'ai_video',
      'voiceover',
      'captions',
      'generation',
      'check',
      'other'
    )
    or action ~ '^[a-z][a-z0-9_]*$'
  );

-- ── Helper: resolve plan monthly allowance from plans table ──
create or replace function public.plan_monthly_credit_allowance(p_plan text)
returns integer
language sql
stable
as $$
  select credits from public.plans where id = p_plan;
$$;

-- ── Helper: is unlimited plan (agency / founder only) ──
create or replace function public.is_unlimited_credit_plan(p_plan text)
returns boolean
language sql
stable
as $$
  select p_plan in ('agency', 'founder')
    or public.plan_monthly_credit_allowance(p_plan) is null
      and p_plan in ('agency', 'founder');
$$;

-- ── Monthly reset (calendar month for free; Stripe period for paid) ──
create or replace function public.maybe_reset_user_credits(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_allowance integer;
  v_reset_at timestamptz;
  v_period_end timestamptz;
  v_profile record;
begin
  select
    plan,
    credits_reset_at,
    credit_balance,
    bonus_credits
  into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return;
  end if;

  v_plan := coalesce(v_profile.plan, 'free');

  if public.is_unlimited_credit_plan(v_plan) then
    return;
  end if;

  v_allowance := public.plan_monthly_credit_allowance(v_plan);
  if v_allowance is null then
    return;
  end if;

  v_reset_at := v_profile.credits_reset_at;

  if v_reset_at is null then
    update public.profiles
    set
      credits_reset_at = (date_trunc('month', now()) + interval '1 month'),
      credit_balance = greatest(
        coalesce(credit_balance, 0),
        v_allowance + coalesce(bonus_credits, 0)
      )
    where id = p_user_id;
    return;
  end if;

  if now() < v_reset_at then
    return;
  end if;

  select s.current_period_end into v_period_end
  from public.subscriptions s
  where s.user_id = p_user_id
    and s.status = 'active'
  order by s.current_period_end desc nulls last
  limit 1;

  update public.profiles
  set
    credit_balance = v_allowance + coalesce(bonus_credits, 0),
    monthly_usage_count = 0,
    credits_reset_at = coalesce(
      v_period_end,
      date_trunc('month', now()) + interval '1 month'
    ),
    usage_reset_date = coalesce(
      v_period_end,
      date_trunc('month', now()) + interval '1 month'
    )
  where id = p_user_id;

  insert into public.credit_adjustments (user_id, amount, reason, metadata)
  values (
    p_user_id,
    v_allowance,
    'subscription_grant',
    jsonb_build_object('plan', v_plan, 'type', 'monthly_reset')
  );
end;
$$;

-- ── Read credit snapshot (check, no deduct) ──
create or replace function public.get_user_credit_status(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_plan text;
  v_allowance integer;
  v_unlimited boolean;
  v_remaining integer;
  v_used integer;
begin
  perform public.maybe_reset_user_credits(p_user_id);

  select
    plan,
    credit_balance,
    bonus_credits,
    monthly_usage_count,
    credits_reset_at,
    usage_reset_date,
    is_banned
  into v_profile
  from public.profiles
  where id = p_user_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  if coalesce(v_profile.is_banned, false) then
    return jsonb_build_object(
      'ok', false,
      'error', 'account_banned',
      'allowed', false
    );
  end if;

  v_plan := coalesce(v_profile.plan, 'free');
  v_unlimited := public.is_unlimited_credit_plan(v_plan);
  v_allowance := public.plan_monthly_credit_allowance(v_plan);
  v_used := coalesce(v_profile.monthly_usage_count, 0);

  if v_unlimited then
    return jsonb_build_object(
      'ok', true,
      'allowed', true,
      'unlimited', true,
      'used', v_used,
      'remaining', null,
      'limit', null,
      'plan', v_plan,
      'usageResetDate', v_profile.credits_reset_at,
      'bonusCredits', coalesce(v_profile.bonus_credits, 0)
    );
  end if;

  v_remaining := greatest(
    0,
    coalesce(v_profile.credit_balance, 0) + coalesce(v_profile.bonus_credits, 0)
  );

  return jsonb_build_object(
    'ok', true,
    'allowed', v_remaining > 0,
    'unlimited', false,
    'used', v_used,
    'remaining', v_remaining,
    'limit', v_allowance,
    'plan', v_plan,
    'usageResetDate', coalesce(v_profile.credits_reset_at, v_profile.usage_reset_date),
    'bonusCredits', coalesce(v_profile.bonus_credits, 0)
  );
end;
$$;

-- ── Atomic credit consumption ──
create or replace function public.consume_user_credits(
  p_user_id uuid,
  p_action text,
  p_credits integer default null,
  p_metadata jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_plan text;
  v_allowance integer;
  v_unlimited boolean;
  v_cost integer;
  v_balance integer;
  v_bonus integer;
  v_total integer;
  v_new_balance integer;
  v_deduct_from_bonus integer := 0;
  v_deduct_from_balance integer;
  v_used integer;
  v_log_id uuid;
  v_existing jsonb;
begin
  if p_idempotency_key is not null and length(trim(p_idempotency_key)) > 0 then
    select jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'allowed', true,
      'unlimited', ul.metadata->>'unlimited' = 'true',
      'used', (p.monthly_usage_count),
      'remaining', ul.balance_after,
      'limit', public.plan_monthly_credit_allowance(p.plan),
      'plan', p.plan,
      'usageResetDate', p.credits_reset_at,
      'logId', ul.id
    )
    into v_existing
    from public.usage_logs ul
    join public.profiles p on p.id = ul.user_id
    where ul.user_id = p_user_id
      and ul.idempotency_key = p_idempotency_key
    limit 1;

    if v_existing is not null then
      return v_existing;
    end if;
  end if;

  select
    plan,
    credit_balance,
    bonus_credits,
    monthly_usage_count,
    credits_reset_at,
    usage_reset_date,
    is_banned,
    workspace_id
  into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found', 'allowed', false);
  end if;

  if coalesce(v_profile.is_banned, false) then
    return jsonb_build_object(
      'ok', false,
      'error', 'account_banned',
      'allowed', false,
      'remaining', 0
    );
  end if;

  perform public.maybe_reset_user_credits(p_user_id);

  select
    plan,
    credit_balance,
    bonus_credits,
    monthly_usage_count,
    credits_reset_at,
    usage_reset_date,
    workspace_id
  into v_profile
  from public.profiles
  where id = p_user_id;

  v_plan := coalesce(v_profile.plan, 'free');
  v_unlimited := public.is_unlimited_credit_plan(v_plan);
  v_allowance := public.plan_monthly_credit_allowance(v_plan);
  v_cost := greatest(1, coalesce(p_credits, 1));
  v_used := coalesce(v_profile.monthly_usage_count, 0);

  if v_unlimited then
    insert into public.usage_logs (
      user_id,
      action,
      feature,
      credits_used,
      balance_after,
      metadata,
      idempotency_key,
      workspace_id
    )
    values (
      p_user_id,
      p_action,
      p_action,
      v_cost,
      null,
      p_metadata || jsonb_build_object('plan', v_plan, 'unlimited', true),
      p_idempotency_key,
      v_profile.workspace_id
    )
    returning id into v_log_id;

    update public.profiles
    set monthly_usage_count = v_used + v_cost
    where id = p_user_id;

    return jsonb_build_object(
      'ok', true,
      'allowed', true,
      'unlimited', true,
      'used', v_used + v_cost,
      'remaining', null,
      'limit', null,
      'plan', v_plan,
      'usageResetDate', v_profile.credits_reset_at,
      'cost', v_cost,
      'logId', v_log_id
    );
  end if;

  v_balance := coalesce(v_profile.credit_balance, 0);
  v_bonus := coalesce(v_profile.bonus_credits, 0);
  v_total := v_balance + v_bonus;

  if v_total < v_cost then
    return jsonb_build_object(
      'ok', true,
      'allowed', false,
      'unlimited', false,
      'used', v_used,
      'remaining', v_total,
      'limit', v_allowance,
      'plan', v_plan,
      'usageResetDate', coalesce(v_profile.credits_reset_at, v_profile.usage_reset_date),
      'cost', v_cost,
      'error', 'insufficient_credits'
    );
  end if;

  if v_bonus >= v_cost then
    v_deduct_from_bonus := v_cost;
    v_deduct_from_balance := 0;
    v_new_balance := v_balance;
  elsif v_bonus > 0 then
    v_deduct_from_bonus := v_bonus;
    v_deduct_from_balance := v_cost - v_bonus;
    v_new_balance := v_balance - v_deduct_from_balance;
  else
    v_deduct_from_bonus := 0;
    v_deduct_from_balance := v_cost;
    v_new_balance := v_balance - v_cost;
  end if;

  update public.profiles
  set
    credit_balance = v_new_balance,
    bonus_credits = v_bonus - v_deduct_from_bonus,
    monthly_usage_count = v_used + v_cost
  where id = p_user_id
    and credit_balance = v_profile.credit_balance
    and bonus_credits = v_profile.bonus_credits;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'error', 'concurrent_update',
      'allowed', false
    );
  end if;

  insert into public.usage_logs (
    user_id,
    action,
    feature,
    credits_used,
    balance_after,
    metadata,
    idempotency_key,
    workspace_id
  )
  values (
    p_user_id,
    p_action,
    p_action,
    v_cost,
    v_new_balance + (v_bonus - v_deduct_from_bonus),
    p_metadata || jsonb_build_object(
      'plan', v_plan,
      'deducted_balance', v_deduct_from_balance,
      'deducted_bonus', v_deduct_from_bonus
    ),
    p_idempotency_key,
    v_profile.workspace_id
  )
  returning id into v_log_id;

  return jsonb_build_object(
    'ok', true,
    'allowed', true,
    'unlimited', false,
    'used', v_used + v_cost,
    'remaining', v_new_balance + (v_bonus - v_deduct_from_bonus),
    'limit', v_allowance,
    'plan', v_plan,
    'usageResetDate', coalesce(v_profile.credits_reset_at, v_profile.usage_reset_date),
    'cost', v_cost,
    'logId', v_log_id
  );
end;
$$;

revoke all on function public.consume_user_credits(uuid, text, integer, jsonb, text) from public;
revoke all on function public.get_user_credit_status(uuid) from public;
revoke all on function public.maybe_reset_user_credits(uuid) from public;

grant execute on function public.get_user_credit_status(uuid) to service_role;
grant execute on function public.consume_user_credits(uuid, text, integer, jsonb, text) to service_role;
grant execute on function public.maybe_reset_user_credits(uuid) to service_role;

-- ── Migrate existing balances to new plan allowances (cap down, refill up on next reset) ──
update public.profiles p
set credit_balance = least(
  coalesce(p.credit_balance, 0),
  coalesce(pl.credits, 999999)
)
from public.plans pl
where pl.id = coalesce(p.plan, 'free')
  and pl.credits is not null
  and coalesce(p.credit_balance, 0) > pl.credits;

update public.profiles
set credit_balance = 25
where coalesce(plan, 'free') = 'free'
  and coalesce(credit_balance, 0) < 25
  and coalesce(subscription_status, 'inactive') <> 'active';

update public.profiles
set credits_reset_at = coalesce(
  credits_reset_at,
  date_trunc('month', now()) + interval '1 month'
)
where credits_reset_at is null;

-- Signup: monthly free allowance
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
    bonus_credits,
    monthly_usage_count,
    last_weekly_refill_at,
    usage_reset_date,
    credits_reset_at,
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
    25,
    0,
    0,
    now(),
    date_trunc('month', now()) + interval '1 month',
    date_trunc('month', now()) + interval '1 month',
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

comment on function public.consume_user_credits is
  'Atomic credit deduction with idempotency, monthly reset, unlimited plan bypass';
