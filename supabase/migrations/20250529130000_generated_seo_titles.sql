-- SEO Title Generator: one row per title variant (flat schema)

create table if not exists public.generated_seo_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_batch_id uuid not null default gen_random_uuid(),
  briefing text not null,
  keyword text not null default '',
  platform text not null default 'Google Search',
  search_intent text not null default 'informational',
  title_text text not null,
  seo_score smallint not null default 0 check (seo_score >= 0 and seo_score <= 100),
  ctr_score smallint not null default 0 check (ctr_score >= 0 and ctr_score <= 100),
  readability_score smallint not null default 0 check (readability_score >= 0 and readability_score <= 100),
  character_count integer not null default 0 check (character_count >= 0),
  is_saved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.generated_seo_titles enable row level security;

create policy "Users read own generated seo titles"
  on public.generated_seo_titles
  for select
  using (auth.uid() = user_id);

create policy "Users insert own generated seo titles"
  on public.generated_seo_titles
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own generated seo titles"
  on public.generated_seo_titles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own generated seo titles"
  on public.generated_seo_titles
  for delete
  using (auth.uid() = user_id);

create index if not exists generated_seo_titles_user_created_idx
  on public.generated_seo_titles (user_id, created_at desc);

create index if not exists generated_seo_titles_batch_idx
  on public.generated_seo_titles (user_id, generation_batch_id, created_at desc);

create index if not exists generated_seo_titles_saved_idx
  on public.generated_seo_titles (user_id, created_at desc)
  where is_saved = true;
