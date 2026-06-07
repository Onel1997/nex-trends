-- Persist dashboard recent activity per user (replaces localStorage-only feed)

create table if not exists public.user_recent_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tool text not null,
  label text not null,
  kind text not null default 'generic',
  created_at timestamptz not null default now()
);

create index if not exists user_recent_activity_user_created_idx
  on public.user_recent_activity (user_id, created_at desc);

alter table public.user_recent_activity enable row level security;

create policy "Users manage own recent activity"
  on public.user_recent_activity
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
