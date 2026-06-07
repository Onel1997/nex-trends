-- AI Ad Copy Generator: one row per ad variant (flat schema)

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
