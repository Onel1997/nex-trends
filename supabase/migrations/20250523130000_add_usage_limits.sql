-- NexTrends: Monthly AI usage limits for Free users

alter table public.profiles
  add column if not exists monthly_usage_count integer not null default 0,
  add column if not exists usage_reset_date timestamptz;

comment on column public.profiles.monthly_usage_count is
  'Anzahl AI-Analysen im aktuellen Abrechnungsmonat (Free User)';
comment on column public.profiles.usage_reset_date is
  'Datum, ab dem monthly_usage_count zurückgesetzt wird';

alter table public.profiles
  drop constraint if exists profiles_monthly_usage_count_nonneg;

alter table public.profiles
  add constraint profiles_monthly_usage_count_nonneg
  check (monthly_usage_count >= 0);

-- Bestehende User: Reset-Datum auf Anfang nächsten Monats setzen
update public.profiles
set usage_reset_date = date_trunc('month', now() at time zone 'utc') + interval '1 month'
where usage_reset_date is null;

create index if not exists profiles_usage_reset_date_idx
  on public.profiles (usage_reset_date)
  where usage_reset_date is not null;
