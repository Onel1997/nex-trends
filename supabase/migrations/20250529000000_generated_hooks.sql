-- AI Hook Generator: generation history + saved hooks

create table if not exists public.generated_hooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  tone text not null,
  platform text not null,
  generated_hooks_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_hooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_id uuid references public.generated_hooks (id) on delete set null,
  hook_text text not null,
  topic text,
  tone text,
  platform text,
  saved_at timestamptz not null default now()
);

alter table public.generated_hooks enable row level security;
alter table public.saved_hooks enable row level security;

create policy "Users read own generated hooks"
  on public.generated_hooks
  for select
  using (auth.uid() = user_id);

create policy "Users insert own generated hooks"
  on public.generated_hooks
  for insert
  with check (auth.uid() = user_id);

create policy "Users delete own generated hooks"
  on public.generated_hooks
  for delete
  using (auth.uid() = user_id);

create policy "Users manage own saved hooks"
  on public.saved_hooks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists generated_hooks_user_created_idx
  on public.generated_hooks (user_id, created_at desc);

create index if not exists saved_hooks_user_saved_at_idx
  on public.saved_hooks (user_id, saved_at desc);

create index if not exists saved_hooks_generation_idx
  on public.saved_hooks (generation_id)
  where generation_id is not null;
