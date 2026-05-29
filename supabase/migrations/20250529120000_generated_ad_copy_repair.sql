-- Idempotent repair: ensure generated_ad_copy flat schema exists.
-- Safe when 20250529100000 was skipped, partially applied, or used legacy jsonb shape.
-- Does NOT touch generated_hooks / saved_hooks.

-- Drop legacy companion table from unreleased jsonb schema (if present).
drop table if exists public.saved_ad_copy;

-- Migrate away from legacy jsonb batch column (single-row-per-generation shape).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'generated_ad_copy'
      and column_name = 'generated_ads_json'
  ) then
    drop table public.generated_ad_copy;
  end if;
end $$;

create table if not exists public.generated_ad_copy (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_batch_id uuid not null default gen_random_uuid(),
  briefing text not null,
  tone text not null,
  platform text not null,
  headline text not null,
  primary_text text not null,
  cta text not null,
  character_count integer not null default 0 check (character_count >= 0),
  is_saved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.generated_ad_copy enable row level security;

alter table public.generated_ad_copy
  add column if not exists generation_batch_id uuid not null default gen_random_uuid(),
  add column if not exists headline text,
  add column if not exists primary_text text,
  add column if not exists cta text,
  add column if not exists character_count integer not null default 0,
  add column if not exists is_saved boolean not null default false;

-- Backfill nullable columns if table existed without NOT NULL constraints.
update public.generated_ad_copy
set
  headline = coalesce(nullif(headline, ''), 'Ad Headline'),
  primary_text = coalesce(nullif(primary_text, ''), headline, 'Ad Copy'),
  cta = coalesce(nullif(cta, ''), 'Jetzt starten'),
  character_count = case
    when character_count > 0 then character_count
    else length(coalesce(headline, '')) + length(coalesce(primary_text, '')) + length(coalesce(cta, ''))
  end
where headline is null
   or primary_text is null
   or cta is null
   or character_count is null;

alter table public.generated_ad_copy
  alter column headline set not null,
  alter column primary_text set not null,
  alter column cta set not null;

drop policy if exists "Users read own generated ad copy" on public.generated_ad_copy;
drop policy if exists "Users insert own generated ad copy" on public.generated_ad_copy;
drop policy if exists "Users update own generated ad copy" on public.generated_ad_copy;
drop policy if exists "Users delete own generated ad copy" on public.generated_ad_copy;

create policy "Users read own generated ad copy"
  on public.generated_ad_copy
  for select
  using (auth.uid() = user_id);

create policy "Users insert own generated ad copy"
  on public.generated_ad_copy
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own generated ad copy"
  on public.generated_ad_copy
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own generated ad copy"
  on public.generated_ad_copy
  for delete
  using (auth.uid() = user_id);

create index if not exists generated_ad_copy_user_created_idx
  on public.generated_ad_copy (user_id, created_at desc);

create index if not exists generated_ad_copy_batch_idx
  on public.generated_ad_copy (user_id, generation_batch_id, created_at desc);

create index if not exists generated_ad_copy_saved_idx
  on public.generated_ad_copy (user_id, created_at desc)
  where is_saved = true;

notify pgrst, 'reload schema';
