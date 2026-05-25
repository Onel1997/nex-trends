-- Prepared schema for syncing saved trends from client localStorage
-- Enable when backend sync is implemented

create table if not exists public.saved_trends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trend_id text not null,
  trend_data jsonb not null,
  saved_at timestamptz not null default now(),
  unique (user_id, trend_id)
);

alter table public.saved_trends enable row level security;

create policy "Users manage own saved trends"
  on public.saved_trends
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists saved_trends_user_saved_at_idx
  on public.saved_trends (user_id, saved_at desc);
