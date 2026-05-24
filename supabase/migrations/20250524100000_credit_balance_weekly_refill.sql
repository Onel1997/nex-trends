-- NexTrends: Credit balance + weekly refill (10 signup, +5/week, max 15)

alter table public.profiles
  add column if not exists credit_balance integer,
  add column if not exists last_weekly_refill_at timestamptz;

-- Backfill existing users from legacy monthly usage model
update public.profiles
set
  credit_balance = greatest(
    0,
    least(15, 10 - coalesce(monthly_usage_count, 0))
  ),
  last_weekly_refill_at = coalesce(last_weekly_refill_at, now()),
  usage_reset_date = coalesce(usage_reset_date, now() + interval '7 days')
where credit_balance is null;

alter table public.profiles
  alter column credit_balance set default 10;

update public.profiles
set credit_balance = 10
where credit_balance is null;

alter table public.profiles
  alter column credit_balance set not null;

alter table public.profiles
  drop constraint if exists profiles_credit_balance_range;

alter table public.profiles
  add constraint profiles_credit_balance_range
  check (credit_balance >= 0 and credit_balance <= 15);

comment on column public.profiles.credit_balance is
  'Verbleibende Free-Credits (Start: 10, max: 15)';
comment on column public.profiles.last_weekly_refill_at is
  'Zeitpunkt der letzten wöchentlichen Credit-Aufladung (+5)';

-- Profiles for auth users missing a row
insert into public.profiles (
  id,
  credit_balance,
  monthly_usage_count,
  last_weekly_refill_at,
  usage_reset_date,
  is_pro,
  subscription_status
)
select
  u.id,
  10,
  0,
  now(),
  now() + interval '7 days',
  false,
  'inactive'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    credit_balance,
    monthly_usage_count,
    last_weekly_refill_at,
    usage_reset_date,
    is_pro,
    subscription_status
  )
  values (
    new.id,
    10,
    0,
    now(),
    now() + interval '7 days',
    false,
    'inactive'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
